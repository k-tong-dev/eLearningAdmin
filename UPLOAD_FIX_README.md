# Strapi v5 File Upload Fix Guide

This guide fixes the "Internal Server Error" when uploading PDF/DOC/DOCX files in Strapi v5 Admin Media Library.

## ✅ Changes Applied

### 1. Updated `config/plugins.ts`
- Changed from Cloudinary to **local provider**
- Set file size limit to **10MB** (10485760 bytes)
- Configured breakpoints for image optimization
- Uses Strapi v5 syntax

### 2. Updated `config/middlewares.ts`
- Increased body parser limits to **50MB** for:
  - `formLimit` (form data)
  - `jsonLimit` (JSON data)
  - `textLimit` (text data)
- Set `formidable.maxFileSize` to **10MB** (10 * 1024 * 1024 bytes)
- All required Strapi core middlewares remain intact

### 3. Upload Directory
- Created/verified `public/uploads` directory
- Directory has write permissions

## 🔧 Manual Steps Required

### Step 1: Clear Strapi Cache
```bash
cd eLearningAdmin

# Remove cache directories
rm -rf .cache
rm -rf build

# On Windows PowerShell:
Remove-Item -Recurse -Force .cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue
```

### Step 2: Rebuild Admin Panel
```bash
pnpm run build
# or
npm run build
```

### Step 3: Verify Upload Configuration
```bash
node scripts/fix-upload-config.js
```

### Step 4: Verify Permissions (Optional)
```bash
node scripts/verify-upload-permissions.js
```

### Step 5: Restart Strapi
```bash
pnpm run develop
# or
npm run develop
```

## ✅ Testing File Upload

1. **Start Strapi** (if not already running)
2. **Login to Admin Panel** at `http://localhost:1337/admin`
3. **Go to Media Library** (left sidebar)
4. **Click "Add new assets"**
5. **Upload a small PDF file** (< 10MB)
   - Test with: `test-resume.pdf` (any small PDF)
6. **Verify upload succeeds** without "Internal Server Error"

## 📋 Supported File Types

The following file types are now supported for uploads:
- **PDF** (`.pdf`)
- **Word Documents** (`.doc`, `.docx`)
- **Images** (`.jpg`, `.png`, `.gif`, etc.)
- **Other files** (up to 10MB)

## 🔍 Troubleshooting

### Issue: Still getting "Internal Server Error"

1. **Check file size**: Ensure file is < 10MB
2. **Check permissions**: Verify `public/uploads` has write permissions
   ```bash
   # Linux/Mac
   chmod -R 755 public/uploads
   
   # Windows: Right-click folder → Properties → Uncheck "Read-only"
   ```
3. **Clear cache again**: Remove `.cache` and `build` directories
4. **Check logs**: Look at Strapi console for detailed error messages
5. **Verify configuration**: Run `node scripts/fix-upload-config.js`

### Issue: "File too large" error

- Current limit is **10MB**
- To increase, update `config/plugins.ts`:
  ```typescript
  sizeLimit: 20971520, // 20MB in bytes
  ```
- Also update `config/middlewares.ts`:
  ```typescript
  formidable: {
    maxFileSize: 20 * 1024 * 1024, // 20MB
  },
  ```

### Issue: Permissions error

- Run the permission setup script:
  ```bash
  pnpm run career:setup-permissions
  ```
- Or manually check in Admin Panel:
  - Settings → Users & Permissions Plugin → Roles
  - Edit "Public" role
  - Enable "upload" permission under "Upload"

## 📝 Configuration Files

### `config/plugins.ts`
```typescript
export default ({ env }) => ({
  upload: {
    config: {
      provider: 'local',
      providerOptions: {
        sizeLimit: 10485760, // 10MB
      },
      // ... breakpoints for images
    },
  },
});
```

### `config/middlewares.ts`
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
},
```

## 🎯 For Job Applications

Job applications use the same upload configuration. The API route at `/api/job-applications` forwards files to Strapi, which now handles them correctly with the updated configuration.

## ✨ Success Indicators

After applying these fixes, you should see:
- ✅ Files upload successfully in Media Library
- ✅ No "Internal Server Error" messages
- ✅ PDF/DOC/DOCX files appear in Media Library
- ✅ Job application file uploads work correctly
- ✅ Files are stored in `public/uploads` directory

## 📚 Additional Resources

- [Strapi v5 Upload Plugin Documentation](https://docs.strapi.io/dev-docs/plugins/upload)
- [Strapi v5 Configuration Guide](https://docs.strapi.io/dev-docs/configurations)
- [Formidable Documentation](https://github.com/node-formidable/formidable)

---

**Last Updated**: After applying Strapi v5 upload configuration fixes

