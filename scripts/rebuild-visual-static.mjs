import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const generatedCssDir = path.join(root, 'assets/css/generated');
const generatedJsDir = path.join(root, 'assets/js/generated');

const assetCopies = [
  ['wp-content/uploads', 'assets/media'],
  ['wp-content/themes/dt-the7', 'assets/vendor/the7'],
  ['wp-content/plugins/elementor', 'assets/vendor/elementor'],
  ['wp-content/plugins/pro-elements', 'assets/vendor/pro-elements'],
  ['wp-content/plugins/dt-the7-core', 'assets/vendor/the7-core'],
  ['wp-includes', 'assets/vendor/core'],
];

const removeAfterBuild = [
  'wp-content',
  'wp-includes',
  'sample-page',
  'src',
  'assets/css/main.css',
  'assets/js/main.js',
  'assets/js/search-data.js',
  'assets/media/elementor/custom-icons/the7-feather/demo.html',
];

function insideWorkspace(relativePath) {
  const absolute = path.resolve(root, relativePath);
  if (absolute !== root && !absolute.startsWith(root + path.sep)) {
    throw new Error(`Refusing path outside workspace: ${absolute}`);
  }
  return absolute;
}

async function exists(relativePath) {
  try {
    await fs.access(insideWorkspace(relativePath));
    return true;
  } catch {
    return false;
  }
}

async function copyDir(from, to) {
  if (!(await exists(from))) return;
  const source = insideWorkspace(from);
  const target = insideWorkspace(to);
  await fs.rm(target, { recursive: true, force: true });
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.cp(source, target, { recursive: true });
}

async function copyFileIfExists(from, to) {
  if (!(await exists(from))) return;
  const source = insideWorkspace(from);
  const target = insideWorkspace(to);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.copyFile(source, target);
}

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

function routeSlug(file) {
  const relative = path.relative(root, file).replaceAll(path.sep, '/');
  if (relative === 'index.html') return 'home';
  return relative.replace(/\/index\.html$/, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
}

function rewriteAssetPaths(text) {
  return text
    .replace(/https?:\/\/(?:www\.)?funoonlab\.com\/wp-content\/uploads/gi, '/assets/media')
    .replace(/https?:\/\/(?:www\.)?funoonlab\.com\/wp-content\/themes\/dt-the7/gi, '/assets/vendor/the7')
    .replace(/https?:\/\/(?:www\.)?funoonlab\.com\/wp-content\/plugins\/elementor/gi, '/assets/vendor/elementor')
    .replace(/https?:\/\/(?:www\.)?funoonlab\.com\/wp-content\/plugins\/pro-elements/gi, '/assets/vendor/pro-elements')
    .replace(/https?:\/\/(?:www\.)?funoonlab\.com\/wp-content\/plugins\/dt-the7-core/gi, '/assets/vendor/the7-core')
    .replace(/(?:\.{0,2}\/)*wp-content\/uploads/gi, '/assets/media')
    .replace(/(?:\.{0,2}\/)*wp-content\/themes\/dt-the7/gi, '/assets/vendor/the7')
    .replace(/(?:\.{0,2}\/)*wp-content\/plugins\/elementor/gi, '/assets/vendor/elementor')
    .replace(/(?:\.{0,2}\/)*wp-content\/plugins\/pro-elements/gi, '/assets/vendor/pro-elements')
    .replace(/(?:\.{0,2}\/)*wp-content\/plugins\/dt-the7-core/gi, '/assets/vendor/the7-core')
    .replace(/(?:\.{0,2}\/)*wp-includes/gi, '/assets/vendor/core')
    .replace(/\/\/wp-content\/themes\/dt-the7/gi, '/assets/vendor/the7')
    .replace(/\\\/\\\/wp-content\\\/uploads/gi, '/assets/media')
    .replace(/\\\/\\\/wp-content\\\/themes\\\/dt-the7/gi, '/assets/vendor/the7')
    .replace(/\\\/\\\/wp-content\\\/plugins\\\/elementor/gi, '/assets/vendor/elementor')
    .replace(/\\\/\\\/wp-content\\\/plugins\\\/pro-elements/gi, '/assets/vendor/pro-elements')
    .replace(/\\\/\\\/wp-content\\\/plugins\\\/dt-the7-core/gi, '/assets/vendor/the7-core')
    .replace(/\\\/\\\/wp-admin\\\/admin-ajax\.php/gi, '#static-wordpress-disabled')
    .replace(/\\\/\\\/wp-json\\\//gi, '#static-wordpress-disabled')
    .replace(/\/\/wp-admin\/admin-ajax\.php/gi, '#static-wordpress-disabled')
    .replace(/\/\/wp-json\/the7\/v1/gi, '#static-wordpress-disabled')
    .replace(/(?:\.{0,2}\/)*wp-json\/[^"'<>\s]+/gi, '#static-wordpress-disabled')
    .replace(/(?:\.{0,2}\/)*xmlrpc\.php\?rsd/gi, '#static-wordpress-disabled');
}

function stripBackendLinks(html) {
  return html
    .replace(/\s*<link[^>]+(?:wp-json|api\.w\.org|xmlrpc|EditURI|oEmbed)[^>]*>\s*/gi, '\n')
    .replace(/\s*<link[^>]+href=["'][^"']*(?:feed\/|comments\/feed\/)[^"']*["'][^>]*>\s*/gi, '\n');
}

async function externalizeBlocks(file, html) {
  const slug = routeSlug(file);
  let cssIndex = 0;
  let jsIndex = 0;
  const writes = [];

  html = html.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi, (_match, _attrs, content) => {
    const body = rewriteAssetPaths(content).trim();
    if (!body) return '';
    cssIndex += 1;
    const name = `${slug}-${String(cssIndex).padStart(2, '0')}.css`;
    writes.push(fs.writeFile(path.join(generatedCssDir, name), body + '\n', 'utf8'));
    return `<link rel="stylesheet" href="/assets/css/generated/${name}">`;
  });

  html = html.replace(/<script\b(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi, (_match, attrs, content) => {
    const body = rewriteAssetPaths(content).trim();
    if (/speculationrules/i.test(attrs)) return '';
    if (!body || /application\/(?:json|ld\+json)/i.test(attrs)) return '';
    jsIndex += 1;
    const name = `${slug}-${String(jsIndex).padStart(2, '0')}.js`;
    writes.push(fs.writeFile(path.join(generatedJsDir, name), body + '\n', 'utf8'));
    return `<script${attrs} src="/assets/js/generated/${name}"></script>`;
  });

  await Promise.all(writes);
  return html;
}

function addStaticHelpers(html) {
  if (!html.includes('/assets/css/static-site.css')) {
    html = html.replace('</head>', '\t<link rel="stylesheet" href="/assets/css/static-site.css">\n</head>');
  }
  if (!html.includes('/assets/js/analytics.js')) {
    html = html.replace('</body>', '\t<script src="/assets/js/analytics.js" defer></script>\n</body>');
  }
  if (!html.includes('/assets/js/static-site.js')) {
    html = html.replace('</body>', '\t<script src="/assets/js/static-site.js" defer></script>\n</body>');
  }
  return html;
}

async function writeStaticHelpers() {
  await fs.mkdir(path.join(root, 'assets/css'), { recursive: true });
  await fs.mkdir(path.join(root, 'assets/js'), { recursive: true });

  await fs.writeFile(path.join(root, 'assets/css/static-site.css'), `a:focus-visible,
button:focus-visible,
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: 3px solid #025373;
  outline-offset: 3px;
}

.static-form-message {
  margin-top: 16px;
  padding: 14px 16px;
  border: 1px solid #9ad8c0;
  border-radius: 6px;
  background: #f3fbf8;
  color: #0b0f1f;
  font-family: Manrope, sans-serif;
  font-size: 15px;
  line-height: 1.5;
}

.static-form-message--error {
  border-color: #f0b4b4;
  background: #fdf3f3;
}

.static-form-message[hidden] {
  display: none;
}
`, 'utf8');

  await fs.writeFile(path.join(root, 'assets/js/static-site.js'), `(function () {
  document.addEventListener('submit', function (event) {
    const form = event.target;
    if (!form.matches('[data-static-form="contact"]')) return;
    event.preventDefault();
    let node = form.querySelector('.static-form-message');
    if (!node) {
      node = document.createElement('div');
      node.className = 'static-form-message';
      node.setAttribute('role', 'status');
      form.appendChild(node);
    }
    node.hidden = false;
    node.textContent = 'Thanks. This static version preserved the form UI; connect it to an email service or API endpoint before using it for live submissions.';
    form.reset();
  });
}());
`, 'utf8');

  await fs.writeFile(path.join(root, 'assets/js/analytics.js'), `window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
const analyticsScript = document.createElement('script');
analyticsScript.async = true;
analyticsScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-MPPC8HMV6S';
document.head.appendChild(analyticsScript);
gtag('js', new Date());
gtag('config', 'G-MPPC8HMV6S');
`, 'utf8');
}

async function main() {
  for (const [from, to] of assetCopies) {
    await copyDir(from, to);
  }

  await copyFileIfExists(
    'assets/vendor/core/js/__qs/d4d009f105bb/comment-reply.min.js',
    'assets/vendor/core/js/comment-reply.min.js'
  );

  const htmlFiles = (await walk(root))
    .filter((file) => file.endsWith('.html'))
    .filter((file) => !path.relative(root, file).replaceAll(path.sep, '/').startsWith('wp-content/'))
    .filter((file) => !path.relative(root, file).replaceAll(path.sep, '/').startsWith('sample-page/'));

  const alreadyExternalized = (await Promise.all(
    htmlFiles.map(async (file) => {
      const html = await fs.readFile(file, 'utf8');
      return html.includes('/assets/css/generated/') || html.includes('/assets/js/generated/');
    })
  )).some(Boolean);

  if (!alreadyExternalized) {
    await fs.rm(generatedCssDir, { recursive: true, force: true });
    await fs.rm(generatedJsDir, { recursive: true, force: true });
  }

  await fs.mkdir(generatedCssDir, { recursive: true });
  await fs.mkdir(generatedJsDir, { recursive: true });

  for (const file of htmlFiles) {
    let html = await fs.readFile(file, 'utf8');
    html = rewriteAssetPaths(html);
    html = stripBackendLinks(html);
    html = await externalizeBlocks(file, html);
    html = html.replace(/<script[^>]+googletagmanager\.com\/gtag\/js[^>]*><\/script>\s*/gi, '');
    html = addStaticHelpers(html);
    await fs.writeFile(file, html, 'utf8');
  }

  await writeStaticHelpers();

  for (const target of removeAfterBuild) {
    await fs.rm(insideWorkspace(target), { recursive: true, force: true });
  }

  console.log(`Rebuilt ${htmlFiles.length} visual static pages.`);
}

main();
