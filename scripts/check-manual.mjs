import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { buildEndpointsPage } from './endpoints.mjs'

const root = path.resolve(process.argv[2] || '.')
const site = path.join(root, 'site')
const failures = []
const manifest = JSON.parse(readFileSync(path.join(site, 'manifest.json'), 'utf8'))
const index = readFileSync(path.join(site, 'index.html'), 'utf8')
const startTag = '<pre>'

function decodeEntities(text) {
  const map = { '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': String.fromCharCode(39), '&amp;': '&' }
  return text.replace(/&(lt|gt|quot|#39|amp);/g, (match) => map[match])
}

function walkHtml(dir, items) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkHtml(full, items)
    else if (entry.isFile() && entry.name.endsWith('.html')) items.push(full)
  }
}

function collectTargets(markup) {
  const targets = []
  for (const attr of ['href="', 'src="']) {
    let i = 0
    while (true) {
      const found = markup.indexOf(attr, i)
      if (found === -1) break
      const start = found + attr.length
      const end = markup.indexOf('"', start)
      if (end === -1) break
      targets.push(markup.slice(start, end))
      i = end + 1
    }
  }
  return targets
}

const excluded = ['.spawn/reference/http/raw/', 'sources/', 'WITHHELD.json']
for (const item of manifest.files) {
  const source = path.join(root, item.path)
  const raw = path.join(site, 'raw', item.path.split('/').map((segment) => segment === '.github' ? '_github' : segment).join('/'))
  const page = path.join(site, 'files', item.page)
  if (excluded.some((prefix) => item.path.startsWith(prefix))) failures.push('excluded file published ' + item.path)
  if (!existsSync(source)) failures.push('missing source ' + item.path)
  if (!existsSync(raw)) failures.push('missing raw copy ' + item.path)
  if (!existsSync(page)) failures.push('missing page ' + item.path)
  if (!index.includes('files/' + item.page)) failures.push('missing index link ' + item.path)
  if (existsSync(raw) && createHash('sha256').update(readFileSync(raw)).digest('hex') !== item.sha256) failures.push('raw hash mismatch ' + item.path)
  if (existsSync(page) && item.text) {
    const markup = readFileSync(page, 'utf8')
    const start = markup.indexOf(startTag)
    const end = markup.indexOf('</pre>', start)
    if (start === -1 || end === -1) failures.push('missing exact display ' + item.path)
    else if (decodeEntities(markup.slice(start + startTag.length, end)) !== readFileSync(source, 'utf8')) failures.push('displayed text mismatch ' + item.path)
  }
}

const htmlFiles = []
walkHtml(site, htmlFiles)
let linksChecked = 0
for (const htmlFile of htmlFiles) {
  for (const target of collectTargets(readFileSync(htmlFile, 'utf8'))) {
    const clean = target.split('#')[0].split('?')[0]
    if (!clean || /^(https?:|mailto:|data:|\/\/|\/)/.test(clean)) continue
    linksChecked += 1
    const resolved = path.resolve(path.dirname(htmlFile), decodeURIComponent(clean))
    if (!existsSync(resolved)) failures.push('broken link ' + target + ' in ' + htmlFile)
  }
}

if (!existsSync(path.join(site, '.nojekyll'))) failures.push('missing .nojekyll')
const workflow = readFileSync(path.join(root, '.github', 'workflows', 'publish.yml'), 'utf8')
for (const marker of ['push:', 'workflow_dispatch:', 'node scripts/build-manual.mjs .', 'node scripts/check-manual.mjs .', 'configure-pages@v5', 'upload-pages-artifact@v3', 'deploy-pages@v5']) {
  if (!workflow.includes(marker)) failures.push('missing workflow marker ' + marker)
}
if (manifest.textCount + manifest.binaryCount !== manifest.files.length) failures.push('manifest kind count mismatch')
let head = ''
try {
  head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
} catch {
  head = ''
}
if (head && manifest.commit !== head) failures.push('site built from ' + manifest.commit + ' but checkout is at ' + head)
if (readFileSync(path.join(root, 'ENDPOINTS.md'), 'utf8') !== buildEndpointsPage(root)) failures.push('ENDPOINTS.md is out of date; run node scripts/endpoints.mjs .')

const result = {
  ok: failures.length === 0,
  sources: manifest.files.length,
  text: manifest.textCount,
  binary: manifest.binaryCount,
  pages: htmlFiles.length,
  linksChecked,
  commit: manifest.commit,
  failures: failures.slice(0, 20),
  failureCount: failures.length
}
console.log(JSON.stringify(result))
if (!result.ok) process.exitCode = 1
