# Job Application Status Field Migration

## 🔄 Migration: `status` → `applyStatus`

The `status` field in job-application has been renamed to `applyStatus` to avoid conflicts with Strapi's internal status system.

## ✅ Changes Applied

### 1. Schema Updated
- **File**: `src/api/job-application/content-types/job-application/schema.json`
- **Change**: Field renamed from `status` to `applyStatus`
- **Enum values**: `["new", "review", "shortlisted", "rejected", "hired"]`
- **Default**: `"new"`

### 2. Controller Updated
- **File**: `src/api/job-application/controllers/job-application.ts`
- **Change**: Now uses `applyStatus` and respects the provided value
- **Before**: Always set `status: 'new'` (ignored user selection)
- **After**: Uses `data.applyStatus || 'new'` (respects user selection)

### 3. Lifecycle Hook Created
- **File**: `src/api/job-application/content-types/job-application/lifecycles.ts`
- **Purpose**: Ensures `applyStatus` is always valid and never empty
- **Validates**: Only allows enum values: `new`, `review`, `shortlisted`, `rejected`, `hired`

### 4. TypeScript Types Updated
- **File**: `v0-elearning/types/career.ts`
- **Change**: `JobApplication` interface now uses `applyStatus` instead of `status`

### 5. API Route Updated
- **File**: `v0-elearning/app/api/job-applications/route.ts`
- **Change**: Maps `applyStatus` from Strapi response
- **Backward compatibility**: Also checks for old `status` field during migration

## 🔧 Manual Steps Required

### Step 1: Restart Strapi
```bash
cd eLearningAdmin
# Stop Strapi if running, then:
pnpm run develop
```

### Step 2: Update Existing Data (Optional)
If you have existing job applications with the old `status` field, you may need to migrate them:

```javascript
// Run in Strapi console or create a migration script
const applications = await strapi.entityService.findMany('api::job-application.job-application', {
  fields: ['id', 'status', 'applyStatus'],
});

for (const app of applications) {
  if (app.status && !app.applyStatus) {
    await strapi.entityService.update('api::job-application.job-application', app.id, {
      data: {
        applyStatus: app.status, // Copy old status to new field
      },
    });
  }
}
```

### Step 3: Verify in Strapi Admin
1. Go to **Content Manager → Job Application**
2. Open any job application
3. Check that **Apply Status** field is visible and working
4. Try changing the status to `review`, `shortlisted`, etc.
5. Save and verify the status is preserved

## ✅ Expected Behavior

### Before Fix:
- ❌ Status selection in Strapi admin was ignored
- ❌ Status always saved as `new` regardless of selection
- ❌ Potential conflicts with Strapi's internal status system

### After Fix:
- ✅ Status selection in Strapi admin is respected
- ✅ Selected status (new, review, shortlisted, etc.) is saved correctly
- ✅ No conflicts with Strapi's internal status system
- ✅ Field name `applyStatus` is clear and descriptive

## 📋 Status Values

| Value | Description |
|-------|-------------|
| `new` | Newly submitted application (default) |
| `review` | Application is under review |
| `shortlisted` | Candidate has been shortlisted |
| `rejected` | Application has been rejected |
| `hired` | Candidate has been hired |

## 🔍 Troubleshooting

### Issue: Status still not saving

1. **Clear Strapi cache**:
   ```bash
   rm -rf .cache build
   pnpm run build
   ```

2. **Check lifecycle hook**: Verify `lifecycles.ts` file exists and is correct

3. **Check controller**: Ensure controller uses `applyStatus` not `status`

4. **Check schema**: Verify schema has `applyStatus` field, not `status`

### Issue: Old data shows as undefined

- Run the migration script above to copy old `status` values to `applyStatus`
- Or manually update records in Strapi admin

### Issue: TypeScript errors

- Ensure `v0-elearning/types/career.ts` uses `applyStatus` in `JobApplication` interface
- Restart TypeScript server in your IDE

## 📝 Files Modified

1. ✅ `eLearningAdmin/src/api/job-application/content-types/job-application/schema.json`
2. ✅ `eLearningAdmin/src/api/job-application/controllers/job-application.ts`
3. ✅ `eLearningAdmin/src/api/job-application/content-types/job-application/lifecycles.ts` (new)
4. ✅ `v0-elearning/types/career.ts`
5. ✅ `v0-elearning/app/api/job-applications/route.ts`

## 🎯 Testing Checklist

- [ ] Restart Strapi after changes
- [ ] Open job application in Strapi admin
- [ ] Change Apply Status to `review`
- [ ] Save the application
- [ ] Verify status is preserved (not reset to `new`)
- [ ] Try other status values: `shortlisted`, `rejected`, `hired`
- [ ] Verify all status values save correctly
- [ ] Check that new applications default to `new`

---

**Status**: ✅ Migration Complete
**Date**: After renaming status to applyStatus

