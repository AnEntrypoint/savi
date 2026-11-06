import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const LF = String.fromCharCode(10)
const TAB = String.fromCharCode(9)
const root = path.resolve(process.argv[2] || '.')
const site = path.join(root, 'site')
const excluded = new Set(['.git', '.playwriter', 'runs', 'site', 'node_modules', 'sources'])
const withheldPrefix = '.spawn/reference/http/raw/'

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll(String.fromCharCode(39), '&#39;')
}

function urlPath(rel) {
  return rel.split('/').map(encodeURIComponent).join('/')
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
      if (excluded.has(entry.name)) continue
      walk(full, items)
    } else if (entry.isFile()) {
      if (rel.startsWith(withheldPrefix)) continue
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
const historyRaw = git(['log', '--date=iso-strict', '--pretty=format:%H%x09%an%x09%ad%x09%s%x09%D'])
const history = historyRaw ? historyRaw.split(LF).map((line) => {
  const fields = line.split(TAB)
  return { hash: fields[0] || '', author: fields[1] || '', date: fields[2] || '', subject: fields[3] || '', refs: fields[4] || '' }
}) : []

let withheld = { policy: 'omit', reason: '', source: '', files: [] }
try {
  withheld = JSON.parse(readFileSync(path.join(root, 'WITHHELD.json'), 'utf8'))
} catch {
  withheld = { policy: 'omit', reason: 'WITHHELD.json was not found.', source: '', files: [] }
}

const sourcePaths = []
walk(root, sourcePaths)
const files = sourcePaths.map((rel) => {
  const data = readFileSync(path.join(root, rel))
  let text = null
  if (!data.includes(0)) {
    try {
      text = data.toString('utf8')
    } catch {
      text = null
    }
  }
  const isText = text !== null
  const lineCount = isText ? (text.length === 0 ? 0 : text.split(LF).length - (text.endsWith(LF) ? 1 : 0)) : 0
  return {
    path: rel,
    bytes: data.length,
    lines: lineCount,
    sha256: createHash('sha256').update(data).digest('hex'),
    text: isText,
    page: pageName(rel),
    raw: urlPath(rel),
    data: data,
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
  'html { background: var(--paper); color: var(--ink); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 14px; }',
  'body { margin: 0; }',
  'a { color: var(--ink); text-decoration: underline; text-underline-offset: 2px; }',
  'a:hover, a:focus { background: var(--ink); color: var(--paper); outline: 3px solid var(--ink); }',
  'header { border-bottom: 8px solid var(--ink); padding: 1rem; }',
  'h1 { font-size: clamp(2rem, 7vw, 5rem); line-height: 0.95; margin: 0 0 1rem; text-transform: uppercase; letter-spacing: -0.06em; }',
  'h2 { font-size: 1.4rem; margin: 2rem 0 0.5rem; text-transform: uppercase; border-top: 6px solid var(--ink); padding-top: 0.5rem; }',
  'h3 { font-size: 1rem; margin: 1rem 0 0.5rem; text-transform: uppercase; }',
  'main { padding: 1rem; }',
  '.bar { display: flex; flex-wrap: wrap; gap: 0.5rem 2rem; border: 3px solid var(--ink); padding: 0.75rem; margin-bottom: 1rem; }',
  '.bar span { font-weight: 700; }',
  '.notice { border: 5px solid var(--ink); padding: 1rem; margin: 1rem 0; background: var(--paper); }',
  'table { width: 100%; border-collapse: collapse; margin: 0 0 2rem; }',
  'th, td { border: 2px solid var(--ink); padding: 0.45rem; vertical-align: top; text-align: left; word-break: break-word; }',
  'th { background: var(--ink); color: var(--paper); text-transform: uppercase; }',
  'tr:nth-child(even) td { background: #eee; }',
  'pre { border: 3px solid var(--ink); padding: 1rem; margin: 0 0 1rem; background: var(--paper); color: var(--ink); white-space: pre-wrap; overflow-wrap: anywhere; }',
  '.meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr)); }',
  '.meta div { border: 3px solid var(--ink); padding: 0.75rem; }',
  '.meta strong { display: block; text-transform: uppercase; }',
  '.links { display: flex; flex-wrap: wrap; gap: 0.75rem; border-bottom: 3px solid var(--ink); padding-bottom: 0.75rem; margin-bottom: 1rem; }',
  '.links a { border: 2px solid var(--ink); padding: 0.35rem 0.6rem; font-weight: 700; }',
  'img.direct { display: block; max-width: 100%; border: 3px solid var(--ink); margin-bottom: 1rem; }',
  'footer { border-top: 8px solid var(--ink); padding: 1rem; }',
  '@media (max-width: 700px) { html { font-size: 12px; } header { border-bottom-width: 5px; } h2 { border-top-width: 4px; } }',
  '@media (prefers-color-scheme: dark) { :root { --ink: #fff; --paper: #000; } tr:nth-child(even) td { background: #222; } }'
].join(LF)
writeFileSync(path.join(site, 'style.css'), style + LF, 'utf8')

function shell(title, body, stylePath) {
  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<title>' + escapeHtml(title) + ' | SAVI DIRECT MANUAL</title>',
    '<link rel="stylesheet" href="' + stylePath + '">',
    '</head>',
    '<body>',
    body,
    '<footer>SAVI DIRECT MANUAL / EXACT BYTES / EVERY PUSH TO MAIN REBUILDS THIS SITE</footer>',
    '</body>',
    '</html>'
  ].join(LF)
}

for (const item of files) {
  const rawTarget = path.join(site, 'raw', item.path)
  mkdirSync(path.dirname(rawTarget), { recursive: true })
  writeFileSync(rawTarget, item.data)
  const rawFromPage = '../raw/' + item.raw
  const isImage = ['.png', '.jpg', '.jpeg', '.gif', '.webp'].some((ext) => item.path.toLowerCase().endsWith(ext))
  const image = !item.text && isImage ? '<img class="direct" src="' + rawFromPage + '" alt="' + escapeHtml(item.path) + '">' : ''
  const fileBody = [
    '<header>',
    '<h1>' + escapeHtml(item.path) + '</h1>',
    '<div class="links"><a href="../index.html">INDEX</a><a href="' + rawFromPage + '">RAW BYTES</a><a href="../manifest.json">MANIFEST</a></div>',
    '</header>',
    '<main>',
    '<div class="meta">',
    '<div><strong>bytes</strong>' + item.bytes + '</div>',
    '<div><strong>lines</strong>' + item.lines + '</div>',
    '<div><strong>kind</strong>' + (item.text ? 'TEXT' : 'BINARY HEX DUMP') + '</div>',
    '<div><strong>sha256</strong>' + item.sha256 + '</div>',
    '<div><strong>commit</strong>' + escapeHtml(commit) + '</div>',
    '</div>',
    '<h2>EXACT DISPLAY</h2>',
    image,
    '<pre class="bytes" id="exact-bytes">' + escapeHtml(item.body) + '</pre>',
    '</main>'
  ].join(LF)
  writeFileSync(path.join(site, 'files', item.page), shell(item.path, fileBody, '../style.css'), 'utf8')
}

const inventoryRows = files.map((item) => [
  '<tr>',
  '<td><a href="files/' + item.page + '">' + escapeHtml(item.path) + '</a></td>',
  '<td>' + item.bytes + '</td>',
  '<td>' + item.lines + '</td>',
  '<td>' + item.sha256 + '</td>',
  '<td>' + (item.text ? 'TEXT' : 'BINARY') + '</td>',
  '<td><a href="raw/' + item.raw + '">RAW</a></td>',
  '</tr>'
].join('')).join(LF)

const withheldRows = withheld.files.map((item) => [
  '<tr>',
  '<td>' + escapeHtml(item.path) + '</td>',
  '<td>' + item.bytes + '</td>',
  '<td>' + item.sha256 + '</td>',
  '<td>WITHHELD / PERSONAL FIELDS</td>',
  '</tr>'
].join('')).join(LF)

const historyRows = history.map((row) => [
  '<tr>',
  '<td>' + escapeHtml(row.hash) + '</td>',
  '<td>' + escapeHtml(row.author) + '</td>',
  '<td>' + escapeHtml(row.date) + '</td>',
  '<td>' + escapeHtml(row.subject) + '</td>',
  '<td>' + escapeHtml(row.refs) + '</td>',
  '</tr>'
].join('')).join(LF)

const totalBytes = files.reduce((n, item) => n + item.bytes, 0)
const withheldBytes = withheld.files.reduce((n, item) => n + item.bytes, 0)
const indexBody = [
  '<header>',
  '<h1>SAVI / DIRECT MANUAL</h1>',
  '<div class="bar"><span>COMMIT ' + escapeHtml(commit) + '</span><span>BRANCH ' + escapeHtml(branch) + '</span><span>FILES ' + files.length + '</span><span>BYTES ' + totalBytes + '</span><span>WITHHELD ' + withheld.files.length + '</span></div>',
  '<div class="links"><a href="#inventory">INVENTORY</a><a href="#withheld">WITHHELD</a><a href="#history">COMMIT HISTORY</a><a href="manifest.json">MANIFEST JSON</a></div>',
  '</header>',
  '<main>',
  '<div class="notice">EVERY COMMITTED FILE IS DISPLAYED DIRECTLY. TEXT FILES APPEAR AS EXACT ESCAPED TEXT. BINARY FILES APPEAR AS FULL HEX DUMPS AND IMAGES. EVERY FILE HAS AN EXACT RAW COPY. RAW HTTP BODIES AND FETCHED RESEARCH SNAPSHOTS ARE WITHHELD BECAUSE THEY CONTAIN PERSONAL FIELDS OR JWT-SHAPED CREDENTIALS; WITHHELD.json LISTS THEIR PATHS, SIZES AND HASHES. A PUSH TO MAIN RUNS publish.yml, REBUILDS THIS SITE, CHECKS IT, AND DEPLOYS IT TO GITHUB PAGES.</div>',
  '<h2 id="inventory">SOURCE INVENTORY</h2>',
  '<table><thead><tr><th>PATH</th><th>BYTES</th><th>LINES</th><th>SHA256</th><th>KIND</th><th>RAW</th></tr></thead><tbody>',
  inventoryRows,
  '</tbody></table>',
  '<h2 id="withheld">WITHHELD</h2>',
  '<div class="notice">' + escapeHtml(withheld.reason) + ' POLICY: ' + escapeHtml(withheld.policy) + '. SOURCE: ' + escapeHtml(withheld.source) + '. TOTAL WITHHELD BYTES: ' + withheldBytes + '.</div>',
  '<table><thead><tr><th>PATH</th><th>BYTES</th><th>SHA256</th><th>STATUS</th></tr></thead><tbody>',
  withheldRows,
  '</tbody></table>',
  '<h2 id="history">COMMIT HISTORY</h2>',
  '<table><thead><tr><th>HASH</th><th>AUTHOR</th><th>DATE</th><th>SUBJECT</th><th>REFS</th></tr></thead><tbody>',
  historyRows,
  '</tbody></table>',
  '</main>'
].join(LF)
writeFileSync(path.join(site, 'index.html'), shell('INDEX', indexBody, 'style.css'), 'utf8')

const notFoundBody = [
  '<header><h1>NOT FOUND</h1></header>',
  '<main><div class="links"><a href="index.html">INDEX</a><a href="manifest.json">MANIFEST</a></div><p>THIS PATH IS NOT IN THE MANUAL.</p></main>'
].join(LF)
writeFileSync(path.join(site, '404.html'), shell('404', notFoundBody, 'style.css'), 'utf8')

const manifest = {
  site: 'SAVI DIRECT MANUAL',
  commit: commit,
  branch: branch,
  sourceCount: files.length,
  textCount: files.filter((item) => item.text).length,
  binaryCount: files.filter((item) => !item.text).length,
  sourceBytes: totalBytes,
  sourceLines: files.reduce((n, item) => n + item.lines, 0),
  withheldCount: withheld.files.length,
  withheldBytes: withheldBytes,
  withheld: withheld,
  files: files.map((item) => ({ path: item.path, bytes: item.bytes, lines: item.lines, sha256: item.sha256, text: item.text, page: item.page, raw: item.raw })),
  history: history
}
writeFileSync(path.join(site, 'manifest.json'), JSON.stringify(manifest, null, 2) + LF, 'utf8')
console.log(JSON.stringify({ commit: commit, branch: branch, files: files.length, bytes: totalBytes, text: manifest.textCount, binary: manifest.binaryCount, withheld: withheld.files.length }))
