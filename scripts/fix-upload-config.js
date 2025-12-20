/**
 * Script to verify and fix upload configuration
 * Run: node scripts/fix-upload-config.js
 */

const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');

console.log('🔧 Fixing Strapi v5 Upload Configuration...\n');

// 1. Ensure upload directory exists
console.log('1. Checking upload directory...');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('   ✅ Created upload directory:', uploadsDir);
} else {
  console.log('   ✅ Upload directory exists:', uploadsDir);
}

// 2. Check write permissions (basic check)
try {
  const testFile = path.join(uploadsDir, '.write-test');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  console.log('   ✅ Write permissions OK');
} catch (error) {
  console.log('   ⚠️  Warning: Write permissions may be restricted');
  console.log('   💡 On Linux/Mac, run: chmod -R 755 public/uploads');
  console.log('   💡 On Windows, ensure the directory is not read-only');
}

// 3. Verify configuration files
console.log('\n2. Verifying configuration files...');

const pluginsPath = path.join(__dirname, '..', 'config', 'plugins.ts');
const middlewaresPath = path.join(__dirname, '..', 'config', 'middlewares.ts');

if (fs.existsSync(pluginsPath)) {
  const pluginsContent = fs.readFileSync(pluginsPath, 'utf8');
  if (pluginsContent.includes("provider: 'local'")) {
    console.log('   ✅ plugins.ts configured with local provider');
  } else {
    console.log('   ⚠️  plugins.ts may not be using local provider');
  }
  
  if (pluginsContent.includes('sizeLimit: 10485760')) {
    console.log('   ✅ File size limit set to 10MB');
  } else {
    console.log('   ⚠️  File size limit may not be configured');
  }
} else {
  console.log('   ❌ plugins.ts not found');
}

if (fs.existsSync(middlewaresPath)) {
  const middlewaresContent = fs.readFileSync(middlewaresPath, 'utf8');
  if (middlewaresContent.includes('formLimit') && middlewaresContent.includes('50mb')) {
    console.log('   ✅ middlewares.ts configured with body parser limits');
  } else {
    console.log('   ⚠️  middlewares.ts may not have body parser limits');
  }
  
  if (middlewaresContent.includes('maxFileSize: 10 * 1024 * 1024')) {
    console.log('   ✅ Formidable maxFileSize set to 10MB');
  } else {
    console.log('   ⚠️  Formidable maxFileSize may not be configured');
  }
} else {
  console.log('   ❌ middlewares.ts not found');
}

console.log('\n3. Next steps:');
console.log('   📝 Clear Strapi cache:');
console.log('      - Delete .cache directory');
console.log('      - Delete build directory');
console.log('   🔄 Rebuild admin panel:');
console.log('      - Run: pnpm run build (or npm run build)');
console.log('   🚀 Restart Strapi:');
console.log('      - Run: pnpm run develop (or npm run develop)');
console.log('   ✅ Test upload:');
console.log('      - Go to Media Library in Strapi admin');
console.log('      - Try uploading a small PDF file (< 10MB)');
console.log('\n✨ Configuration check complete!\n');

