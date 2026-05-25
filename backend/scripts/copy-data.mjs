import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src/data/characterGameIds.json');
const destDir = path.join(root, 'dist/data');
const dest = path.join(destDir, 'characterGameIds.json');

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log('copied characterGameIds.json → dist/data/');
