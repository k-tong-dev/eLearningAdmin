/**
 * Script to set public permissions for menu-controller
 * Run this after creating the menu-controller content type
 */

'use strict';

async function setMenuControllerPermissions() {
  const { createStrapi } = require('@strapi/strapi');
  const strapi = await createStrapi().load();

  try {
    // Find the ID of the public role
    const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
      where: {
        type: 'public',
      },
    });

    if (!publicRole) {
      console.error('Public role not found!');
      process.exit(1);
    }

    console.log('Found public role:', publicRole.id);

    // Check if permission already exists
    const existingPermission = await strapi.query('plugin::users-permissions.permission').findOne({
      where: {
        action: 'api::menu-controller.menu-controller.find',
        role: publicRole.id,
      },
    });

    if (existingPermission) {
      console.log('Permission already exists. Skipping...');
    } else {
      // Create the permission
      await strapi.query('plugin::users-permissions.permission').create({
        data: {
          action: 'api::menu-controller.menu-controller.find',
          role: publicRole.id,
        },
      });
      console.log('✓ Created find permission for menu-controller');
    }

    // Check if findOne permission exists
    const existingFindOnePermission = await strapi.query('plugin::users-permissions.permission').findOne({
      where: {
        action: 'api::menu-controller.menu-controller.findOne',
        role: publicRole.id,
      },
    });

    if (existingFindOnePermission) {
      console.log('findOne permission already exists. Skipping...');
    } else {
      // Create the findOne permission
      await strapi.query('plugin::users-permissions.permission').create({
        data: {
          action: 'api::menu-controller.menu-controller.findOne',
          role: publicRole.id,
        },
      });
      console.log('✓ Created findOne permission for menu-controller');
    }

    console.log('\n✅ Permissions set successfully!');
    console.log('Public role can now access menu-controllers API');
    
    await strapi.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Error setting permissions:', error);
    await strapi.destroy();
    process.exit(1);
  }
}

setMenuControllerPermissions();

