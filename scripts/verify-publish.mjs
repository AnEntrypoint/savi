import { execFileSync } from 'node:child_process'
import path from 'node:path'

const root = path.resolve(process.argv[2] || '.')
const run = (args) => execFileSync(args[0], args.slice(1), { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()

const head = run(['git', 'rev-parse', 'HEAD'])
const runs = JSON.parse(run(['gh', 'run', 'list', '--workflow', 'publish.yml', '--branch', 'main', '--limit', '20', '--json', 'headSha,status,conclusion,url']))
const match = runs.find((item) => item.headSha === head)
const result = match
  ? { ok: match.status === 'completed' && match.conclusion === 'success', head, status: match.status, conclusion: match.conclusion, url: match.url }
  : { ok: false, head, status: 'no run for this commit' }
console.log(JSON.stringify(result))
if (!result.ok) process.exitCode = 1
