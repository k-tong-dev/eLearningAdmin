# Fix ApplyStatus Field Permissions

## 🔴 Problem
Getting "No permissions to see this field" error when trying to use `applyStatus` in Strapi admin panel.

## ✅ Solution

### Option 1: Run the Fix Script (Recommended)

```bash
cd eLearningAdmin
node scripts/fix-applystatus-permissions.js
```

This script will:
- Find all admin roles (Super Admin, Editor, etc.)
- Ensure they have full permissions for job-application
- Enable create, read, update, delete permissions
- Make the `applyStatus` field visible and editable

### Option 2: Manual Fix in Strapi Admin

1. **Go to Settings → Roles**
2. **Click on "Super Admin" role** (or your admin role)
3. **Scroll to "Job Application" section**
4. **Enable all permissions**:
   - ✅ Create
   - ✅ Read
   - ✅ Update
   - ✅ Delete
5. **Click "Save"**

### Option 3: Clear Cache and Rebuild

Sometimes the field visibility issue is due to cached admin panel:

```bash
cd eLearningAdmin

# Clear cache
rm -rf .cache build

# Rebuild admin panel
pnpm run build

# Restart Strapi
pnpm run develop
```

## 🔍 Verify the Fix

1. **Go to Content Manager → Job Application**
2. **Open any job application**
3. **Check that `applyStatus` field is visible**
4. **Try changing the status** (new, review, shortlisted, etc.)
5. **Save and verify** the status is preserved

## 📋 Expected Behavior After Fix

- ✅ `applyStatus` field is visible in Content Manager
- ✅ You can select different status values
- ✅ Status selection is saved correctly
- ✅ No "No permissions to see this field" error

## 🚨 If Still Not Working

1. **Check Content Manager Settings**:
   - Go to Settings → Content Manager → Job Application
   - Ensure all fields are visible

2. **Check Field Configuration**:
   - Verify `schema.json` has `applyStatus` field (not `status`)
   - Field type should be `enumeration`
   - Enum values: `["new", "review", "shortlisted", "rejected", "hired"]`

3. **Check Admin Role**:
   - Ensure you're logged in as Super Admin or Editor
   - Verify your role has job-application permissions

4. **Restart Strapi**:
   - Stop Strapi completely
   - Clear cache: `rm -rf .cache build`
   - Rebuild: `pnpm run build`
   - Start: `pnpm run develop`

## 📝 Files to Check

1. ✅ `src/api/job-application/content-types/job-application/schema.json` - Has `applyStatus` field
2. ✅ `src/api/job-application/controllers/job-application.ts` - Uses `applyStatus`
3. ✅ `src/api/job-application/content-types/job-application/lifecycles.ts` - Validates `applyStatus`

---

**Status**: Ready to fix
**Script**: `scripts/fix-applystatus-permissions.js`

