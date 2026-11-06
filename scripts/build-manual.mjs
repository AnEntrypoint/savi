import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const LF = String.fromCharCode(10)
const TAB = String.fromCharCode(9)
const root = path.resolve(process.argv[2] || '.')
const site = path.join(root, 'site')
const excludedDirs = new Set(['.git', '.playwriter', 'runs', 'site', 'node_modules', 'sources'])
const withheldPrefixes = ['.spawn/reference/http/raw/']

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll(String.fromCharCode(39), '&#39;')
}

function rawPath(rel) {
  return rel.split('/').map((segment) => segment === '.github' ? '_github' : segment).join('/')
}

function pageName(rel) {
  return Buffer.from(rel, 'utf8').toString('hex') + '.html'
}

function walk(dir, items) {
  const entries = readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    const rel = path.relative(root, full).split(path.sep).join('/')
    if (entry.isDirectory()) {
      if (excludedDirs.has(entry.name)) continue
      walk(full, items)
    } else if (entry.isFile()) {
      if (withheldPrefixes.some((prefix) => rel.startsWith(prefix))) continue
      items.push(rel)
    }
  }
}

function hexDump(data) {
  const lines = []
  for (let offset = 0; offset < data.length; offset += 16) {
    const chunk = data.subarray(offset, offset + 16)
    const hex = Array.from(chunk, (byte) => byte.toString(16).padStart(2, '0')).join(' ')
    const ascii = Array.from(chunk, (byte) => byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.').join('')
    lines.push(offset.toString(16).padStart(8, '0') + '  ' + hex.padEnd(47, ' ') + '  |' + ascii + '|')
  }
  return lines.join(LF)
}

function git(args) {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return ''
  }
}

const commit = git(['rev-parse', 'HEAD']) || 'NO_COMMIT'
const branch = git(['branch', '--show-current']) || 'DETACHED'
const historyRaw = git(['log', '--date=short', '--pretty=format:%h%x09%ad%x09%s'])
const history = historyRaw ? historyRaw.split(LF).map((line) => {
  const [hash = '', date = '', subject = ''] = line.split(TAB)
  return { hash, date, subject }
}) : []

const sourcePaths = []
walk(root, sourcePaths)
const files = sourcePaths.map((rel) => {
  const data = readFileSync(path.join(root, rel))
  const isText = !data.includes(0)
  const text = isText ? data.toString('utf8') : null
  return {
    path: rel,
    bytes: data.length,
    lines: isText ? (text.length === 0 ? 0 : text.split(LF).length - (text.endsWith(LF) ? 1 : 0)) : 0,
    sha256: createHash('sha256').update(data).digest('hex'),
    text: isText,
    page: pageName(rel),
    data,
    body: isText ? text : hexDump(data)
  }
})

rmSync(site, { recursive: true, force: true })
mkdirSync(path.join(site, 'raw'), { recursive: true })
mkdirSync(path.join(site, 'files'), { recursive: true })
writeFileSync(path.join(site, '.nojekyll'), '', 'utf8')

const style = [
  ':root { color-scheme: light; --ink: #000; --paper: #fff; }',
  '* { box-sizing: border-box; }',
  'html { background: var(--paper); color: var(--ink); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 15px; }',
  'body { margin: 0; }',
  'a { color: var(--ink); }',
  'a:hover, a:focus { background: var(--ink); color: var(--paper); }',
  'header { border-bottom: 8px solid var(--ink); padding: 1rem; }',
  'h1 { font-size: clamp(2rem, 6vw, 4rem); line-height: 1; margin: 0 0 0.75rem; text-transform: uppercase; }',
  'h2 { font-size: 1.1rem; margin: 2rem 0 0.75rem; text-transform: uppercase; border-top: 4px solid var(--ink); padding-top: 0.5rem; }',
  'main { padding: 1rem; }',
  'ul { list-style: none; padding: 0; margin: 0; }',
  'li { border-bottom: 1px solid var(--ink); padding: 0.4rem 0; display: flex; justify-content: space-between; gap: 1rem; }',
  'table { width: 100%; border-collapse: collapse; }',
  'th, td { border: 2px solid var(--ink); padding: 0.4rem; text-align: left; vertical-align: top; }',
  'th { text-transform: uppercase; }',
  'pre { border: 3px solid var(--ink); padding: 1rem; white-space: pre-wrap; overflow-wrap: anywhere; margin: 0 0 1rem; }',
  '.meta { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }',
  '.meta span { border: 2px solid var(--ink); padding: 0.3rem 0.6rem; }',
  '.links { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem; }',
  '.links a { border: 2px solid var(--ink); padding: 0.3rem 0.6rem; text-decoration: none; font-weight: 700; }',
  'img.direct { display: block; max-width: 100%; border: 3px solid var(--ink); margin-bottom: 1rem; }',
  'footer { border-top: 8px solid var(--ink); padding: 1rem; }',
  '@media (prefers-color-scheme: dark) { :root { --ink: #fff; --paper: #000; } }'
].join(LF)
writeFileSync(path.join(site, 'style.css'), style + LF, 'utf8')

function shell(title, body, stylePath) {
  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<title>' + escapeHtml(title) + ' | Savi Manual</title>',
    '<link rel="stylesheet" href="' + stylePath + '">',
    '</head>',
    '<body>',
    body,
    '<footer>SAVI MANUAL / ' + escapeHtml(commit.slice(0, 7)) + ' / REBUILT ON EVERY PUSH TO MAIN</footer>',
    '</body>',
    '</html>'
  ].join(LF)
}

for (const item of files) {
  const rawTarget = path.join(site, 'raw', rawPath(item.path))
  mkdirSync(path.dirname(rawTarget), { recursive: true })
  writeFileSync(rawTarget, item.data)
  const rawLink = '../raw/' + rawPath(item.path).split('/').map(encodeURIComponent).join('/')
  const isImage = ['.png', '.jpg', '.jpeg', '.gif', '.webp'].some((ext) => item.path.toLowerCase().endsWith(ext))
  const image = !item.text && isImage ? '<img class="direct" src="' + rawLink + '" alt="' + escapeHtml(item.path) + '">' : ''
  const fileBody = [
    '<header>',
    '<h1>' + escapeHtml(item.path) + '</h1>',
    '<div class="meta"><span>' + item.bytes + ' BYTES</span><span>' + item.lines + ' LINES</span><span>' + (item.text ? 'TEXT' : 'BINARY, HEX') + '</span></div>',
    '<div class="links"><a href="../index.html">INDEX</a><a href="' + rawLink + '">RAW</a></div>',
    '</header>',
    '<main>',
    image,
    '<pre>' + escapeHtml(item.body) + '</pre>',
    '</main>'
  ].join(LF)
  writeFileSync(path.join(site, 'files', item.page), shell(item.path, fileBody, '../style.css'), 'utf8')
}

const groups = new Map()
for (const item of files) {
  const top = item.path.includes('/') ? item.path.split('/')[0] : '(root)'
  if (!groups.has(top)) groups.set(top, [])
  groups.get(top).push(item)
}
const fileSections = [...groups.entries()].map(([top, items]) => [
  '<h2>' + escapeHtml(top) + ' / ' + items.length + ' FILES</h2>',
  '<ul>',
  items.map((item) => '<li><a href="files/' + item.page + '">' + escapeHtml(item.path) + '</a><span>' + item.bytes + '</span></li>').join(LF),
  '</ul>'
].join(LF)).join(LF)

const historyRows = history.map((row) => '<tr><td>' + escapeHtml(row.date) + '</td><td>' + escapeHtml(row.hash) + '</td><td>' + escapeHtml(row.subject) + '</td></tr>').join(LF)
const totalBytes = files.reduce((n, item) => n + item.bytes, 0)
const indexBody = [
  '<header>',
  '<h1>Savi Manual</h1>',
  '<div class="meta"><span>COMMIT ' + escapeHtml(commit.slice(0, 7)) + '</span><span>BRANCH ' + escapeHtml(branch) + '</span><span>' + files.length + ' FILES</span><span>' + totalBytes + ' BYTES</span></div>',
  '<div class="links"><a href="#files">FILES</a><a href="#history">HISTORY</a><a href="manifest.json">MANIFEST</a></div>',
  '</header>',
  '<main>',
  '<h2 id="files">FILES</h2>',
  fileSections,
  '<h2 id="history">HISTORY</h2>',
  '<table><thead><tr><th>DATE</th><th>COMMIT</th><th>SUBJECT</th></tr></thead><tbody>',
  historyRows,
  '</tbody></table>',
  '</main>'
].join(LF)
writeFileSync(path.join(site, 'index.html'), shell('Index', indexBody, 'style.css'), 'utf8')

const notFoundBody = [
  '<header><h1>Not found</h1><div class="links"><a href="index.html">INDEX</a></div></header>',
  '<main><p>This path is not in the manual.</p></main>'
].join(LF)
writeFileSync(path.join(site, '404.html'), shell('Not found', notFoundBody, 'style.css'), 'utf8')

const manifest = {
  site: 'Savi Manual',
  commit: commit,
  branch: branch,
  sourceCount: files.length,
  textCount: files.filter((item) => item.text).length,
  binaryCount: files.filter((item) => !item.text).length,
  sourceBytes: totalBytes,
  files: files.map((item) => ({ path: item.path, bytes: item.bytes, lines: item.lines, sha256: item.sha256, text: item.text, page: item.page })),
  history: history
}
writeFileSync(path.join(site, 'manifest.json'), JSON.stringify(manifest, null, 2) + LF, 'utf8')
console.log(JSON.stringify({ commit: commit, branch: branch, files: files.length, bytes: totalBytes, text: manifest.textCount, binary: manifest.binaryCount }))
