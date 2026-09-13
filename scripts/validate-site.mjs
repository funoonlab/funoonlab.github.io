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

function toPosix(file) {
  return file.replaceAll(path.sep, '/');
}

function normalizeAssetReference(rawUrl, ownerFile) {
  const cleanUrl = rawUrl
    .trim()
    .replace(/^["']|["']$/g, '')
    .replaceAll('\\/', '/')
    .split('?')[0]
    .split('#')[0];

  if (
    !cleanUrl ||
    cleanUrl.startsWith('data:') ||
    cleanUrl.startsWith('#') ||
    /^[a-z][a-z0-9+.-]*:/i.test(cleanUrl) ||
    cleanUrl.startsWith('//')
  ) {
    return null;
  }

  if (cleanUrl.startsWith('/assets/')) return cleanUrl.slice(1);
  if (cleanUrl.startsWith('assets/')) return cleanUrl;

  const ownerDirectory = path.posix.dirname(toPosix(ownerFile));
  const relativeAsset = path.posix.normalize(path.posix.join(ownerDirectory, cleanUrl));
  return relativeAsset.startsWith('assets/') ? relativeAsset : null;
}

function collectSrcsetReferences(srcset, ownerFile) {
  return srcset
    .split(',')
    .map((candidate) => candidate.trim().split(/\s+/)[0])
    .map((candidate) => normalizeAssetReference(candidate, ownerFile))
    .filter(Boolean);
}

function collectReferences(text, ownerFile) {
  const refs = [];
  const extension = path.extname(ownerFile).toLowerCase();
  const patterns = [];

  if (extension === '.html') {
    patterns.push(/(?:^|[\s<])(?:href|src)=["']([^"']+)["']/g);
    for (const match of text.matchAll(/\bsrcset=["']([^"']+)["']/g)) {
      refs.push(...collectSrcsetReferences(match[1], ownerFile));
    }
  }

  if (['.css', '.html', '.svg'].includes(extension)) {
    patterns.push(/url\((?!['"]?data:)([^)]+)\)/g);
    patterns.push(/@import\s+(?:url\()?["']?([^'")\s]+)["']?\)?/g);
  }

  if (['.js', '.json'].includes(extension)) {
    patterns.push(/["'](\/assets\/[^"']+)["']/g);
  }

  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const ref = normalizeAssetReference(match[1], ownerFile);
      if (ref) refs.push(ref);
    }
  }

  return refs;
}

const files = await walk(root);
const htmlFiles = files
  .filter((file) => file.endsWith('.html'))
  .map((file) => toPosix(path.relative(root, file)));
const errors = [];
const checkedAssets = new Set();
const assetQueue = [];
const reportedMissing = new Set();

if (htmlFiles.length !== expectedHtmlFiles) {
  errors.push(`Expected ${expectedHtmlFiles} HTML files, found ${htmlFiles.length}`);
}

async function checkAssetReference(ownerFile, ref) {
  if (!(await exists(ref))) {
    const key = `${ownerFile}:${ref}`;
    if (!reportedMissing.has(key)) {
      reportedMissing.add(key);
      errors.push(`${ownerFile} references missing asset ${ref}`);
    }
    return;
  }

  if (!checkedAssets.has(ref)) {
    checkedAssets.add(ref);
    assetQueue.push(ref);
  }
}

for (const file of htmlFiles) {
  const html = await fs.readFile(path.join(root, file), 'utf8');
  for (const term of forbiddenTerms) {
    if (html.toLowerCase().includes(term)) {
      errors.push(`${file} contains ${term}`);
    }
  }

  for (const ref of collectReferences(html, file)) await checkAssetReference(file, ref);
}

while (assetQueue.length) {
  const asset = assetQueue.shift();
  const extension = path.extname(asset).toLowerCase();
  if (!['.css', '.js', '.json', '.svg'].includes(extension)) continue;

  const content = await fs.readFile(path.join(root, asset), 'utf8');
  for (const ref of collectReferences(content, asset)) await checkAssetReference(asset, ref);
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
