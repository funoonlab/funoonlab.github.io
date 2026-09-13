import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const expectedHtmlFiles = 32;
const forbiddenTerms = [
  'wp-content',
  'wp-includes',
  'wp-admin',
  'wp-json',
  'xmlrpc.php',
  'admin-ajax.php',
];

async function walk(directory) {
  const output = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      output.push(...await walk(full));
    } else {
      output.push(full);
    }
  }
  return output;
}

async function exists(relativePath) {
  try {
    await fs.access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

const files = await walk(root);
const htmlFiles = files
  .filter((file) => file.endsWith('.html'))
  .map((file) => path.relative(root, file).replaceAll(path.sep, '/'));
const errors = [];

if (htmlFiles.length !== expectedHtmlFiles) {
  errors.push(`Expected ${expectedHtmlFiles} HTML files, found ${htmlFiles.length}`);
}

for (const file of htmlFiles) {
  const html = await fs.readFile(path.join(root, file), 'utf8');
  for (const term of forbiddenTerms) {
    if (html.toLowerCase().includes(term)) {
      errors.push(`${file} contains ${term}`);
    }
  }

  const refs = [...html.matchAll(/(?:href|src)=["']([^"']+)["']/g)]
    .map((match) => match[1])
    .filter((url) => url.startsWith('/assets/'))
    .map((url) => url.slice(1).split('?')[0].split('#')[0]);

  for (const ref of refs) {
    if (!(await exists(ref))) {
      errors.push(`${file} references missing asset ${ref}`);
    }
  }
}

for (const directory of ['wp-content', 'wp-includes', 'wp-admin', 'sample-page']) {
  if (await exists(directory)) {
    errors.push(`Legacy directory still exists: ${directory}`);
  }
}

const result = {
  htmlFiles: htmlFiles.length,
  errors,
};

console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exit(1);
