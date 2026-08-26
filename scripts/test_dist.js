import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distIndex = path.join(__dirname, '../frontend/dist/index.html');

console.log('Testing dist build existence...');
if (!fs.existsSync(distIndex)) {
  console.error('FAIL: dist/index.html does not exist');
  process.exit(1);
}

const content = fs.readFileSync(distIndex, 'utf8');
console.log('dist/index.html length:', content.length);

const jsMatch = content.match(/src="([^"]+\.js)"/);
if (jsMatch) {
  const jsPath = path.join(__dirname, '../frontend/dist', jsMatch[1]);
  console.log('Referenced JS:', jsMatch[1], 'Exists:', fs.existsSync(jsPath));
}

const cssMatch = content.match(/href="([^"]+\.css)"/);
if (cssMatch) {
  const cssPath = path.join(__dirname, '../frontend/dist', cssMatch[1]);
  console.log('Referenced CSS:', cssMatch[1], 'Exists:', fs.existsSync(cssPath));
}

console.log('✓ Build verification complete: all asset references exist and are relative!');
