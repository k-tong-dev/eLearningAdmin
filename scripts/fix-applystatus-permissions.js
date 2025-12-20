'use strict';

const { createStrapi, compileStrapi } = require('@strapi/strapi');

async function fixApplyStatusPermissions() {
  try {
    console.log('Loading Strapi...');
    const appContext = await compileStrapi();
    const app = await createStrapi(appContext).load();

    console.log('\n=== Fixing ApplyStatus Field Permissions ===\n');

    // Get all admin roles (Super Admin, Editor, etc.)
    const adminRoles = await app.query('admin::role').findMany({
      where: {},
    });

    console.log(`Found ${adminRoles.length} admin role(s):`);
    adminRoles.forEach(role => {
      console.log(`  - ${role.name} (${role.code})`);
    });

    // For each admin role, ensure they have full permissions for job-application
    for (const role of adminRoles) {
      console.log(`\n📋 Updating permissions for ${role.name}...`);

      // Get existing permissions for this role
      const existingPermissions = await app.query('admin::permission').findMany({
        where: {
          role: role.id,
          subject: 'api::job-application.job-application',
        },
      });

      // Permissions needed for job-application
      const requiredActions = [
        'create',
        'read',
        'update',
        'delete',
        'publish',
        'unpublish',
      ];

      for (const action of requiredActions) {
        const actionName = `api::job-application.job-application.${action}`;
        
        // Check if permission exists
        const existing = existingPermissions.find(p => p.action === actionName);

        if (existing) {
          // Update existing permission to ensure it's enabled
          if (!existing.enabled) {
            await app.query('admin::permission').update({
              where: { id: existing.id },
              data: { enabled: true },
            });
            console.log(`  ✓ Enabled: ${action}`);
          } else {
            console.log(`  ✓ Already enabled: ${action}`);
          }
        } else {
          // Create new permission
          await app.query('admin::permission').create({
            data: {
              action: actionName,
              subject: 'api::job-application.job-application',
              role: role.id,
              enabled: true,
            },
          });
          console.log(`  ✓ Created: ${action}`);
        }
      }
    }

    console.log('\n✅ Admin permissions updated successfully!');
    console.log('\n📝 Next steps:');
    console.log('  1. Clear Strapi cache: rm -rf .cache build');
    console.log('  2. Rebuild admin: pnpm run build');
    console.log('  3. Restart Strapi: pnpm run develop');
    console.log('  4. Go to Content Manager → Job Application');
    console.log('  5. Verify applyStatus field is visible and editable');

    await app.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing permissions:', error);
    process.exit(1);
  }
}

fixApplyStatusPermissions();

