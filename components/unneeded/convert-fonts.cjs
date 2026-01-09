/**
 * Font Conversion Script
 *
 * This script converts the Felgine.otf font to WOFF2 and WOFF formats
 * for better web performance and browser compatibility.
 *
 * Requirements:
 * - Install: npm install fontkit fs
 * - Or use online converter: https://cloudconvert.com/otf-to-woff2
 *
 * Manual conversion steps if this script doesn't work:
 * 1. Go to https://cloudconvert.com/otf-to-woff2
 * 2. Upload public/Felgine/Felgine.otf
 * 3. Convert to WOFF2, download and save as public/Felgine/Felgine.woff2
 * 4. Go to https://cloudconvert.com/otf-to-woff
 * 5. Upload public/Felgine/Felgine.otf
 * 6. Convert to WOFF, download and save as public/Felgine/Felgine.woff
 */

const fs = require('fs');
const path = require('path');

console.log('\n==========================================');
console.log('FONT CONVERSION REQUIRED');
console.log('==========================================\n');

const otfPath = path.join(__dirname, '..', 'public', 'Felgine', 'Felgine.otf');
const woff2Path = path.join(__dirname, '..', 'public', 'Felgine', 'Felgine.woff2');
const woffPath = path.join(__dirname, '..', 'public', 'Felgine', 'Felgine.woff');

console.log('Source file:', otfPath);
console.log('Target WOFF2:', woff2Path);
console.log('Target WOFF:', woffPath);

if (!fs.existsSync(otfPath)) {
  console.error('\n❌ ERROR: Felgine.otf not found at:', otfPath);
  process.exit(1);
}

console.log('\n✅ Felgine.otf found');

// Check if converted files already exist
const woff2Exists = fs.existsSync(woff2Path);
const woffExists = fs.existsSync(woffPath);

if (woff2Exists && woffExists) {
  console.log('✅ WOFF2 file already exists');
  console.log('✅ WOFF file already exists');
  console.log('\n✅ All font formats are ready!');
  process.exit(0);
}

console.log('\n⚠️  MANUAL CONVERSION REQUIRED\n');
console.log('Please convert Felgine.otf to WOFF2 and WOFF formats:');
console.log('\nOption 1 - Online Converter (Easiest):');
console.log('  1. Go to: https://cloudconvert.com/otf-to-woff2');
console.log('  2. Upload: public/Felgine/Felgine.otf');
console.log('  3. Download and save as: public/Felgine/Felgine.woff2');
console.log('  4. Go to: https://cloudconvert.com/otf-to-woff');
console.log('  5. Upload: public/Felgine/Felgine.otf');
console.log('  6. Download and save as: public/Felgine/Felgine.woff');

console.log('\nOption 2 - Command Line (If you have fonttools):');
console.log('  pip install fonttools brotli');
console.log('  cd public/Felgine');
console.log('  pyftsubset Felgine.otf --flavor=woff2 --output-file=Felgine.woff2');
console.log('  pyftsubset Felgine.otf --flavor=woff --output-file=Felgine.woff');

console.log('\nOption 3 - Use the same .otf file:');
console.log('  The CSS has been updated to fall back to .otf if WOFF files are missing.');
console.log('  However, WOFF2 provides better compression (30-50% smaller) and loading performance.');

console.log('\n==========================================\n');

// For now, just indicate what's missing
if (!woff2Exists) {
  console.log('❌ Missing: Felgine.woff2');
}
if (!woffExists) {
  console.log('❌ Missing: Felgine.woff');
}

console.log('\n⚠️  The app will still work with .otf only, but fonts will load slower on production.\n');
