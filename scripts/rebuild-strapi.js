/**
 * Quick script to clear cache and rebuild Strapi
 * Run: node scripts/rebuild-strapi.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.join(__dirname, '..');

console.log('🔄 Rebuilding Strapi Admin Panel...\n');

// 1. Clear cache
console.log('1. Clearing cache...');
const cacheDir = path.join(projectRoot, '.cache');
const buildDir = path.join(projectRoot, 'build');

try {
  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true, force: true });
    console.log('   ✅ Removed .cache directory');
  } else {
    console.log('   ℹ️  .cache directory does not exist');
  }
} catch (error) {
  console.log('   ⚠️  Error removing .cache:', error.message);
}

try {
  if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true, force: true });
    console.log('   ✅ Removed build directory');
  } else {
    console.log('   ℹ️  build directory does not exist');
  }
} catch (error) {
  console.log('   ⚠️  Error removing build:', error.message);
}

// 2. Rebuild
console.log('\n2. Rebuilding admin panel...');
try {
  execSync('pnpm run build', { 
    cwd: projectRoot, 
    stdio: 'inherit',
    shell: true 
  });
  console.log('\n   ✅ Build completed successfully!');
} catch (error) {
  console.log('\n   ❌ Build failed. Try running manually: pnpm run build');
  process.exit(1);
}

console.log('\n✨ Rebuild complete!');
console.log('   🚀 You can now start Strapi with: pnpm run develop\n');

