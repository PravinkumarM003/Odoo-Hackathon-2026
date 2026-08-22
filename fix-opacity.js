const fs = require('fs');

const tailwindConfigPath = 'tailwind.config.ts';
let twConfig = fs.readFileSync(tailwindConfigPath, 'utf8');

twConfig = twConfig.replace(/var\(--neutral-([0-9]+)\)/g, 'rgb(var(--neutral-$1) / <alpha-value>)');
fs.writeFileSync(tailwindConfigPath, twConfig);

const globalsCssPath = 'app/globals.css';
let globalsCss = fs.readFileSync(globalsCssPath, 'utf8');

// Replace hex with rgb values in :root (Light mode - inverted)
globalsCss = globalsCss.replace(/--neutral-50: #020617;/g, '--neutral-50: 2 6 23;');
globalsCss = globalsCss.replace(/--neutral-100: #0f172a;/g, '--neutral-100: 15 23 42;');
globalsCss = globalsCss.replace(/--neutral-200: #1e293b;/g, '--neutral-200: 30 41 59;');
globalsCss = globalsCss.replace(/--neutral-300: #334155;/g, '--neutral-300: 51 65 85;');
globalsCss = globalsCss.replace(/--neutral-400: #475569;/g, '--neutral-400: 71 85 105;');
globalsCss = globalsCss.replace(/--neutral-500: #64748b;/g, '--neutral-500: 100 116 139;');
globalsCss = globalsCss.replace(/--neutral-600: #94a3b8;/g, '--neutral-600: 148 163 184;');
globalsCss = globalsCss.replace(/--neutral-700: #cbd5e1;/g, '--neutral-700: 203 213 225;');
globalsCss = globalsCss.replace(/--neutral-800: #e2e8f0;/g, '--neutral-800: 226 232 240;');
globalsCss = globalsCss.replace(/--neutral-900: #f1f5f9;/g, '--neutral-900: 241 245 249;');
globalsCss = globalsCss.replace(/--neutral-950: #f8fafc;/g, '--neutral-950: 248 250 252;');

// Replace hex with rgb values in .dark (Dark mode - original)
globalsCss = globalsCss.replace(/--neutral-50: #f8fafc;/g, '--neutral-50: 248 250 252;');
globalsCss = globalsCss.replace(/--neutral-100: #f1f5f9;/g, '--neutral-100: 241 245 249;');
globalsCss = globalsCss.replace(/--neutral-200: #e2e8f0;/g, '--neutral-200: 226 232 240;');
globalsCss = globalsCss.replace(/--neutral-300: #cbd5e1;/g, '--neutral-300: 203 213 225;');
globalsCss = globalsCss.replace(/--neutral-400: #94a3b8;/g, '--neutral-400: 148 163 184;');
globalsCss = globalsCss.replace(/--neutral-500: #64748b;/g, '--neutral-500: 100 116 139;');
globalsCss = globalsCss.replace(/--neutral-600: #475569;/g, '--neutral-600: 71 85 105;');
globalsCss = globalsCss.replace(/--neutral-700: #334155;/g, '--neutral-700: 51 65 85;');
globalsCss = globalsCss.replace(/--neutral-800: #1e293b;/g, '--neutral-800: 30 41 59;');
globalsCss = globalsCss.replace(/--neutral-900: #0f172a;/g, '--neutral-900: 15 23 42;');
globalsCss = globalsCss.replace(/--neutral-950: #020617;/g, '--neutral-950: 2 6 23;');

fs.writeFileSync(globalsCssPath, globalsCss);
console.log('Fixed Tailwind CSS variable opacity compatibility');
