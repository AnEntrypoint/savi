import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

const LF = String.fromCharCode(10)
const root = path.resolve(process.argv[2] || '.')
const site = path.join(root, 'site')
const failures = []
const manifest = JSON.parse(readFileSync(path.join(site, 'manifest.json'), 'utf8'))
const index = readFileSync(path.join(site, 'index.html'), 'utf8')
const startTag = '<pre class="bytes" id="exact-bytes">'

function decodeEntities(text) {
  const map = { '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': String.fromCharCode(39), '&amp;': '&' }
  const keys = Object.keys(map)
  let out = ''
  let i = 0
  while (i < text.length) {
    if (text[i] === '&') {
      let matched = false
      for (const key of keys) {
        if (text.startsWith(key, i)) {
          out += map[key]
          i += key.length
          matched = true
          break
        }
      }
      if (matched) continue
    }
    out += text[i]
    i += 1
  }
  return out
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

for (const item of manifest.files) {
  const source = path.join(root, item.path)
  const raw = path.join(site, 'raw', item.path)
  const page = path.join(site, 'files', item.page)
  if (!existsSync(source)) failures.push('missing source ' + item.path)
  if (!existsSync(raw)) failures.push('missing raw copy ' + item.path)
  if (!existsSync(page)) failures.push('missing page ' + item.path)
  if (!index.includes('files/' + item.page)) failures.push('missing index page link ' + item.path)
  if (!index.includes('raw/' + item.raw)) failures.push('missing index raw link ' + item.path)
  if (existsSync(raw)) {
    const rawHash = createHash('sha256').update(readFileSync(raw)).digest('hex')
    if (rawHash !== item.sha256) failures.push('raw hash mismatch ' + item.path)
  }
  if (existsSync(page) && item.text) {
    const markup = readFileSync(page, 'utf8')
    const start = markup.indexOf(startTag)
    const end = markup.indexOf('</pre>', start)
    if (start === -1 || end === -1) failures.push('missing exact display ' + item.path)
    else {
      const displayed = decodeEntities(markup.slice(start + startTag.length, end))
      if (displayed !== readFileSync(source, 'utf8')) failures.push('displayed text mismatch ' + item.path)
    }
  }
  if (existsSync(page) && !item.text && !readFileSync(page, 'utf8').includes('BINARY HEX DUMP')) failures.push('missing hex label ' + item.path)
}

for (const item of manifest.withheld.files) {
  if (existsSync(path.join(site, 'raw', item.path))) failures.push('withheld raw copy leaked ' + item.path)
  if (!index.includes(item.path) || !index.includes(item.sha256)) failures.push('missing withheld ledger row ' + item.path)
}

const htmlFiles = []
walkHtml(site, htmlFiles)
let linksChecked = 0
for (const htmlFile of htmlFiles) {
  const markup = readFileSync(htmlFile, 'utf8')
  for (const target of collectTargets(markup)) {
    const clean = target.split('#')[0].split('?')[0]
    if (!clean || clean.startsWith('http:') || clean.startsWith('https:') || clean.startsWith('mailto:') || clean.startsWith('data:') || clean.startsWith('//') || clean.startsWith('/')) continue
    linksChecked += 1
    let resolved
    try {
      resolved = path.resolve(path.dirname(htmlFile), decodeURIComponent(clean))
    } catch {
      failures.push('bad link encoding ' + target + ' in ' + htmlFile)
      continue
    }
    if (!existsSync(resolved)) failures.push('broken link ' + target + ' in ' + htmlFile)
  }
}

if (!existsSync(path.join(site, '.nojekyll'))) failures.push('missing .nojekyll')
const workflow = readFileSync(path.join(root, '.github', 'workflows', 'publish.yml'), 'utf8')
for (const marker of ['on:', 'push:', 'workflow_dispatch:', 'node scripts/build-manual.mjs .', 'node scripts/check-manual.mjs .', 'configure-pages@v5', 'enablement: true', 'upload-pages-artifact@v3', 'include-hidden-files: true', 'deploy-pages@v5']) {
  if (!workflow.includes(marker)) failures.push('missing workflow marker ' + marker)
}
if (manifest.sourceCount !== manifest.files.length) failures.push('manifest source count mismatch')
if (manifest.textCount + manifest.binaryCount !== manifest.files.length) failures.push('manifest kind count mismatch')
const result = {
  ok: failures.length === 0,
  sources: manifest.files.length,
  text: manifest.textCount,
  binary: manifest.binaryCount,
  withheld: manifest.withheldCount,
  pages: htmlFiles.length,
  linksChecked: linksChecked,
  commit: manifest.commit,
  failures: failures.slice(0, 20),
  failureCount: failures.length
}
console.log(JSON.stringify(result))
if (!result.ok) process.exitCode = 1
