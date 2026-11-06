import os
import re
import subprocess

BASE = '/workspace/savi/.spawn/reference/engine-deep/'
CLONE = '/workspace/savi/.spawn/engine/'


def git(args):
    return subprocess.run(['git', '-C', CLONE] + args, capture_output=True, text=True).stdout.strip()


head = git(['rev-parse', '--short', 'HEAD'])
sha = ''
for line in open(CLONE + 'engine.yaml', encoding='utf-8'):
    if line.startswith('sha256:'):
        sha = line.split(':', 1)[1].strip()
assert head and len(sha) == 64, (head, sha)
kernel = sha[:12]
recent = git(['log', '--oneline', '-8']).splitlines()

# ENGINE.md: pin sentence and gotcha line.
p = BASE + 'ENGINE.md'
s = open(p, encoding='utf-8').read()
s = re.sub(r'(The live pin in the clone is `sha256: )[0-9a-f]{64}(`)',
           lambda m: m.group(1) + sha + m.group(2), s)
s = re.sub(r'\(HEAD `[0-9a-f]+`, "kernel [0-9a-f]+", fetched[^)]*\)',
           '(HEAD `' + head + '`, "kernel ' + kernel + '", fetched 2026-11-05; earlier pins are in the README pin history)', s)
s = re.sub(r'(?m)^1\. Pin: .*$',
           '1. Pin: `pin-and-untracked.md` and the clone engine.yaml now agree: `sha256: ' + kernel + '...` with HEAD `' + head + '`. The sha256 prefix matches the kernel prefix in each commit subject (observed). Whether "kernel" and "engine build" are the same artifact is inferred from the matching prefix.', s)
open(p, 'w', encoding='utf-8').write(s)

# Headers in the two files that name the engine commit.
for name in ['internals-sources.md', 'world-usage.md']:
    p = BASE + name
    s = open(p, encoding='utf-8').read()
    s = re.sub(r'engine [0-9a-f]{7}', 'engine ' + head, s)
    open(p, 'w', encoding='utf-8').write(s)

# README pin history table: add the current commit once, mark it current.
p = BASE + 'README.md'
s = open(p, encoding='utf-8').read()
s = s.replace('| pin only (current) |', '| pin only |')
lines = [ln for ln in s.splitlines(keepends=True)
         if not re.match(r'^\| ' + re.escape(head) + r' \| ', ln)]
row = '| ' + head + ' | ' + kernel + ' | pin only (current) |'
insert_at = None
for i, line in enumerate(lines):
    if line.startswith('| ') and 'pin only' in line:
        insert_at = i + 1
assert insert_at is not None, 'pin table not found'
lines.insert(insert_at, row + '\n')
open(p, 'w', encoding='utf-8').write(''.join(lines))

# pin-and-untracked.md: rebuild with live git data.
count = git(['rev-list', '--count', 'HEAD'])
recent_lines = '\n'.join('- ' + line for line in recent[:6])
pin = '''# Engine pin and untracked files (refreshed by update-engine-pin.py)

Clone: /workspace/savi/.spawn/engine, HEAD ''' + head + ''' (''' + count + ''' commits in this shallow clone; the original 899b3bf pin is not present).

Pin (engine.yaml, the only tracked file whose content changes between releases):
- semver: 6.0.0
- sha256: ''' + sha + '''
- The commit subject names the kernel as ''' + kernel + ''', the first 12 hex characters of that sha256. The mapping is inferred from the prefix; the docs do not state it. Room-host logs and a spawn client fallback message in this session named runtime engines whose prefixes match commit subjects here, which supports the inference.

Recent commits (git log):
''' + recent_lines + '''
Every commit has the same subject and differs only in the kernel hash. The net doc diff since 4134071 is pin bumps only; README.md holds the pin history and the four sections of API changes.

Untracked in the engine clone: keys.py and probe.sh. Neither is upstream.
- keys.py: Python 3. For each file argument it loads JSON and prints the sorted top-level keys, or the length and sorted item keys of a top-level array. Non-JSON prints "non-json body". No writes, no network.
- probe.sh: bash. Sends GET requests to https://www.spawn.co, once with the bearer token from /config/.spawn/token and once without. Saves bodies under .spawn/reference/http/raw and runs keys.py on each. GET-only per its header. Read, not run.
'''
open(BASE + 'pin-and-untracked.md', 'w', encoding='utf-8').write(pin)

# Refresh the README index sizes.
p = BASE + 'README.md'
s = open(p, encoding='utf-8').read()
names = ['ENGINE.md', 'api-a.md', 'api-b.md', 'skills-a.md', 'skills-b.md', 'world-usage.md', 'pin-and-untracked.md', 'live-probe-results.md', 'internals-sources.md', 'kernel-worker.md']
for name in names:
    size = os.path.getsize(BASE + name)
    s = re.sub(r'(\| ' + re.escape(name) + r' \| )\d+( \|)', lambda m, size=size: m.group(1) + str(size) + m.group(2), s)
open(p, 'w', encoding='utf-8').write(s)
print('head', head, 'kernel', kernel, 'sha', sha, 'commits', count)
print('sizes', {n: os.path.getsize(BASE + n) for n in names})
