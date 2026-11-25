import * as esbuild from 'esbuild';
import { execSync } from 'node:child_process';
import fs from 'node:fs';

fs.mkdirSync('dist', { recursive: true });
await esbuild.build({
  entryPoints: ['src/main.tsx'], bundle: true, minify: true, outfile: 'dist/app.js',
  jsx: 'automatic', target: 'es2019', define: { 'process.env.NODE_ENV': '"production"' },
});
execSync('npx tailwindcss -i src/styles.css -o dist/app.css --minify', { stdio: 'inherit' });
const js = fs.readFileSync('dist/app.js', 'utf8').split('</script').join('<\/script');
const css = fs.readFileSync('dist/app.css', 'utf8');
const favicon = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#0076a8"/><circle cx="12" cy="16" r="6" fill="none" stroke="#fff" stroke-width="3"/><circle cx="20" cy="16" r="6" fill="none" stroke="#f9823a" stroke-width="3"/></svg>');
const html = [
  '<!doctype html>', '<html lang="en">', '<head>', '<meta charset="utf-8" />',
  '<meta name="viewport" content="width=device-width, initial-scale=1" />',
  '<title>Connect@MW · Connecting People Beyond Work (Prototype)</title>',
  '<link rel="icon" href="' + favicon + '" />',
  '<style>' + css + '</style>', '</head>', '<body>',
  '<div id="root"></div>',
  '<script>' + js + '</script>', '</body>', '</html>',
].join('\n');
fs.writeFileSync('../connect-mw.html', html);
console.log('Built ../connect-mw.html (' + Math.round(html.length / 1024) + ' KB)');
