const fs = require('fs');
const path = require('path');

const directories = ['app', 'components'];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // We want to replace text-white with text-neutral-50
      // but NOT if it's already something like text-white/50
      content = content.replace(/text-white(?!\/)/g, 'text-neutral-50');
      
      // Replace bg-white/ with bg-neutral-50/
      content = content.replace(/bg-white\//g, 'bg-neutral-50/');
      
      // Replace border-white/ with border-neutral-50/
      content = content.replace(/border-white\//g, 'border-neutral-50/');
      
      // Replace ring-white/ with ring-neutral-50/
      content = content.replace(/ring-white\//g, 'ring-neutral-50/');

      // Replace bg-neutral-950 with bg-background (we will define this)
      // Actually, let's just invert the neutral scale in CSS, so bg-neutral-950 is fine!
      
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

for (const dir of directories) {
  processDirectory(dir);
}
console.log('Refactoring complete.');
