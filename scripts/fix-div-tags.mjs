import fs from 'fs';
import path from 'path';

function walk(dir, files = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, files);
    else if (/\.tsx?$/.test(f)) files.push(p);
  }
  return files;
}

const tag = 'div';
const root = path.resolve('frontend/src');
for (const file of walk(root)) {
  let c = fs.readFileSync(file, 'utf8');
  const out = c.replace(/<\/?motion\b/g, (m) => (m.startsWith('</') ? `</${tag}` : `<${tag}`));
  if (out !== c) {
    fs.writeFileSync(file, out);
    console.log('fixed:', file);
  }
}
