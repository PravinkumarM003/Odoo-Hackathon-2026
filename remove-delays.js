const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = [...walk('app'), ...walk('components')];
let changed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Match `delay: i * 0.04` or `, delay: i * 0.04` or `delay: i * 0.04, `
  const original = content;
  content = content.replace(/,\s*delay:\s*i\s*\*\s*[0-9.]+/g, '');
  content = content.replace(/delay:\s*i\s*\*\s*[0-9.]+\s*,?/g, '');
  if (content !== original) {
    fs.writeFileSync(file, content);
    changed++;
    console.log(`Updated ${file}`);
  }
});
console.log(`Finished, updated ${changed} files.`);
