/**
 * Script to verify Media Library permissions for uploads
 * Run: node scripts/verify-upload-permissions.js
 * 
 * This script checks if the necessary permissions are set for file uploads
 * in the Strapi Media Library.
 */

const strapi = require('@strapi/strapi');

async function verifyPermissions() {
  console.log('🔍 Verifying Strapi Upload Permissions...\n');

  try {
    // Initialize Strapi
    const app = await strapi().load();
    
    // Get the upload plugin service
    const uploadService = app.plugin('upload').service('upload');
    
    // Check if upload service is available
    if (!uploadService) {
      console.log('❌ Upload service not found');
      return;
    }
    
    console.log('✅ Upload service is available');
    
    // Get roles
    const roleService = app.plugin('users-permissions').service('role');
    const roles = await roleService.find();
    
    console.log('\n📋 Checking role permissions:');
    
    for (const role of roles) {
      const permissions = role.permissions || [];
      const uploadPermissions = permissions.filter(p => 
        p.action.includes('upload') || 
        p.action.includes('plugin::upload')
      );
      
      if (uploadPermissions.length > 0) {
        console.log(`\n   Role: ${role.name} (${role.type})`);
        uploadPermissions.forEach(perm => {
          console.log(`      - ${perm.action}: ${perm.enabled ? '✅ Enabled' : '❌ Disabled'}`);
        });
      }
    }
    
    // Check public role specifically
    const publicRole = roles.find(r => r.type === 'public');
    if (publicRole) {
      const hasUploadPermission = publicRole.permissions?.some(p => 
        p.action === 'plugin::upload.content-api.upload' && p.enabled
      );
      
      if (hasUploadPermission) {
        console.log('\n✅ Public role has upload permission (for job applications)');
      } else {
        console.log('\n⚠️  Public role may not have upload permission');
        console.log('   💡 Run: pnpm run career:setup-permissions');
      }
    }
    
    await app.destroy();
    console.log('\n✨ Permission check complete!\n');
    
  } catch (error) {
    console.error('❌ Error verifying permissions:', error.message);
    console.log('\n💡 Make sure Strapi is properly configured and database is accessible');
  }
}

// Run if called directly
if (require.main === module) {
  verifyPermissions().catch(console.error);
}

module.exports = { verifyPermissions };

