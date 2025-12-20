'use strict';

const { createStrapi, compileStrapi } = require('@strapi/strapi');

async function setupCareerPermissions() {
  try {
    console.log('Loading Strapi...');
    const appContext = await compileStrapi();
    const app = await createStrapi(appContext).load();

    console.log('\n=== Setting up Career Module Permissions ===\n');

    // Find the public role
    const publicRole = await app.query('plugin::users-permissions.role').findOne({
      where: { type: 'public' },
    });

    if (!publicRole) {
      console.log('❌ Public role not found!');
      await app.destroy();
      process.exit(1);
    }

    console.log('Found Public role:', publicRole.name);

    // Permissions to enable
    const permissionsToCreate = [
      // Job permissions
      { action: 'api::job.job.find', role: publicRole.id },
      { action: 'api::job.job.findOne', role: publicRole.id },
      
      // Department permissions
      { action: 'api::department.department.find', role: publicRole.id },
      { action: 'api::department.department.findOne', role: publicRole.id },
      
      // Job Application permissions (only create)
      { action: 'api::job-application.job-application.create', role: publicRole.id },
    ];

    console.log('\nCreating permissions...\n');

    for (const perm of permissionsToCreate) {
      // Check if permission already exists
      const existing = await app.query('plugin::users-permissions.permission').findOne({
        where: {
          action: perm.action,
          role: perm.role,
        },
      });

      if (existing) {
        console.log(`✓ ${perm.action} - Already exists`);
      } else {
        await app.query('plugin::users-permissions.permission').create({
          data: perm,
        });
        console.log(`✓ ${perm.action} - Created`);
      }
    }

    console.log('\n✅ Permissions configured successfully!');
    console.log('\nSummary:');
    console.log('  - Public can view jobs (find, findOne)');
    console.log('  - Public can view departments (find, findOne)');
    console.log('  - Public can submit applications (create)');
    console.log('  - Admin can manage everything (default)');

    await app.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Error setting up permissions:', error);
    process.exit(1);
  }
}

setupCareerPermissions();

