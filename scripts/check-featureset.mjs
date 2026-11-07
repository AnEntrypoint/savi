import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { execFileSync } from "node:child_process"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const savi = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const docs = join(savi, "docs")
const reference = join(savi, ".spawn", "reference")
const jayzee = "/workspace/jayzee"
const files = ["FEATURESET.md", "JAYZEE-GAPS.md", "OPEN-ITEMS.md"]
const texts = Object.fromEntries(files.map((f) => [f, readFileSync(join(docs, f), "utf8")]))
const errors = []
const counts = {}
let claimsChecked = 0

const registerStatuses = new Set(["OPEN", "INFERRED", "UNVERIFIED", "BEHAVIOUR", "DIFFERENT-DATASET", "HELD-OWNER"])
const gapStatuses = new Set(["built", "partial", "open"])
const gapTags = new Set(["required-in-jayzee", "none (built)"])
const countStatusPrefixes = ["REPRODUCED", "UNVERIFIED", "MATCHES RELAY"]
const jayzeePathPattern = /([A-Za-z0-9_./-]+\.(?:js|mjs|json|md|tsv|bin|ts))\s*\(jayzee[^)]*\)/g
const splitCells = (line) => line.split(/(?<!\\)\|/).slice(1, -1).map((cell) => cell.trim())
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]))
const rowOf = (file, prefix) => {
  const found = texts[file].split("\n").filter((l) => l.startsWith(prefix))
  if (found.length !== 1) {
    errors.push(`${file}: expected one row starting "${prefix}", found ${found.length}`)
    return ""
  }
  return found[0]
}
const claim = (file, text, description) => {
  claimsChecked++
  if (!texts[file].includes(text)) errors.push(`${file}: claim does not match its fixture: ${description}`)
}

const workspacePaths = new Set()
for (const [file, text] of Object.entries(texts)) {
  for (const match of text.matchAll(/\/workspace\/[A-Za-z0-9_./*-]+/g)) {
    workspacePaths.add(JSON.stringify([file, match[0].replace(/[.,;:)\]]+$/, "")]))
  }
}
counts.workspacePaths = workspacePaths.size
for (const entry of workspacePaths) {
  const [file, path] = JSON.parse(entry)
  if (path.includes("*")) {
    const base = path.slice(0, path.indexOf("*"))
    const dir = base.slice(0, base.lastIndexOf("/") + 1)
    const name = path.slice(dir.length)
    const pattern = new RegExp("^" + name.replace(/[.+?^${}()|[\]\\*]/g, (c) => (c === "*" ? ".*" : "\\" + c)) + "$")
    if (!existsSync(dir) || !readdirSync(dir).some((entryName) => pattern.test(entryName))) {
      errors.push(`${file}: wildcard path matches nothing: ${path}`)
    }
  } else if (!existsSync(path)) {
    errors.push(`${file}: missing cited path: ${path}`)
  }
}

let tmpRefs = 0
for (const [file, text] of Object.entries(texts)) {
  for (const line of text.split("\n")) {
    if (!line.includes("/tmp/")) continue
    tmpRefs++
    if (/^\s*(?:-\s*)?(?:Source paths|Sources|Source)\b/i.test(line)) {
      errors.push(`${file}: /tmp path in a source position: ${line.slice(0, 120)}`)
    } else if (!/ephemeral|provenance/i.test(line)) {
      errors.push(`${file}: /tmp path without an ephemeral or provenance label: ${line.slice(0, 120)}`)
    }
  }
}
counts.tmpReferences = tmpRefs

let statusTokens = 0
for (const line of texts["OPEN-ITEMS.md"].split("\n")) {
  if (!line.startsWith("Status: ")) continue
  statusTokens++
  const value = line.slice("Status: ".length).trim()
  if (!registerStatuses.has(value)) errors.push(`OPEN-ITEMS.md: status outside the allowed set: ${value}`)
}
counts.registerStatusTokens = statusTokens

const pinMatch = texts["JAYZEE-GAPS.md"].match(/`([0-9a-f]{7,40})`/)
const pin = pinMatch ? pinMatch[1] : null
if (!pin) errors.push("JAYZEE-GAPS.md: no jayzee commit pin found in the header")

const jayzeeTree = pin ? new Set(execFileSync("git", ["-C", jayzee, "ls-tree", "-r", "--name-only", pin], { encoding: "utf8" }).split("\n")) : new Set()
const parityText = pin ? execFileSync("git", ["-C", jayzee, "show", `${pin}:docs/PARITY.md`], { encoding: "utf8" }) : ""
const rankedSection = parityText.split("\n## Ranked rows")[1]?.split("\n## Split")[0] ?? ""
const parityRows = new Map(
  rankedSection
    .split(/\n(?=\d+\. )/)
    .filter((row) => /^\d+\. /.test(row))
    .map((row) => {
      const normalised = row.replace(/\n+/g, " ").trim()
      const number = Number(normalised.match(/^(\d+)\./)[1])
      const paths = [...normalised.matchAll(jayzeePathPattern)].map((m) => m[1])
      const status = (normalised.match(/Status: ([a-z]+)/) || [])[1] || null
      return [number, { paths, status }]
    }),
)
counts.parityRows = parityRows.size

const gapLines = texts["JAYZEE-GAPS.md"].split("\n")
const tableRows = gapLines
  .filter((line) => /^\| \d+ \|/.test(line))
  .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()))
counts.gapRows = tableRows.length
let requiredRows = 0
let builtRows = 0
const openWithoutTarget = []
const namedNotCreated = []
tableRows.forEach((cells, index) => {
  const [numberText, , status, , jzCount, tag] = cells
  const number = Number(numberText)
  if (number !== index + 1) errors.push(`JAYZEE-GAPS.md: row ${numberText} is not sequential at position ${index + 1}`)
  if (!gapStatuses.has(status)) errors.push(`JAYZEE-GAPS.md: row ${number} status outside the allowed set: ${status}`)
  if (!gapTags.has(tag)) errors.push(`JAYZEE-GAPS.md: row ${number} tag outside the allowed set: ${tag}`)
  const parity = parityRows.get(number)
  if (!parity) {
    errors.push(`JAYZEE-GAPS.md: row ${number} has no ranked row at ${pin}`)
    return
  }
  if (parity.status !== status) errors.push(`JAYZEE-GAPS.md: row ${number} status ${status} differs from ${pin} (${parity.status})`)
  const existing = parity.paths.filter((path) => jayzeeTree.has(path)).length
  if (jzCount !== `${existing}/${parity.paths.length}`) errors.push(`JAYZEE-GAPS.md: row ${number} path count ${jzCount} differs from ${pin} (${existing}/${parity.paths.length})`)
  if (tag === "required-in-jayzee") {
    requiredRows++
    if (status === "open") {
      if (existing === 0) openWithoutTarget.push(number)
      if (parity.paths.some((path) => !jayzeeTree.has(path))) namedNotCreated.push(number)
    } else {
      if (parity.paths.length === 0) errors.push(`JAYZEE-GAPS.md: required row ${number} (${status}) cites no jayzee path`)
      for (const path of parity.paths) if (!jayzeeTree.has(path)) errors.push(`JAYZEE-GAPS.md: required row ${number} cites a path absent at ${pin}: ${path}`)
    }
  } else {
    builtRows++
  }
})
if (tableRows.length !== parityRows.size) errors.push(`JAYZEE-GAPS.md: ${tableRows.length} rows against ${parityRows.size} ranked rows at ${pin}`)
const expectedOpenWithoutTarget = [9, 32]
const expectedNamedNotCreated = [9, 23, 32]
const sameList = (a, b) => a.length === b.length && a.every((n, i) => n === b[i])
if (!sameList(openWithoutTarget, expectedOpenWithoutTarget)) errors.push(`JAYZEE-GAPS.md: open required rows with no existing jayzee target are [${openWithoutTarget.join(", ")}], expected [${expectedOpenWithoutTarget.join(", ")}]`)
if (!sameList(namedNotCreated, expectedNamedNotCreated)) errors.push(`JAYZEE-GAPS.md: open required rows naming a jayzee path not created at ${pin} are [${namedNotCreated.join(", ")}], expected [${expectedNamedNotCreated.join(", ")}]`)
counts.requiredInJayzee = requiredRows
counts.builtRows = builtRows

const savedSection = gapLines.slice(gapLines.findIndex((line) => line.startsWith("## Savi-owned")) + 1)
const unmapped = savedSection.filter((line) => line.startsWith("- ") && /UNMAPPED|UNVERIFIED/.test(line))
for (const line of unmapped) {
  if (!/\/workspace\/savi\//.test(line)) errors.push(`JAYZEE-GAPS.md: savi-owned item has no durable savi path: ${line.slice(0, 100)}`)
}
counts.savedItemsNeedingPath = unmapped.length

const countTableStatuses = []
for (const line of texts["FEATURESET.md"].split("\n")) {
  if (!line.startsWith("| ")) continue
  const cells = splitCells(line)
  if (cells.length !== 4 || /^-+$/.test(cells[0]) || cells[0] === "Figure") continue
  countTableStatuses.push(cells[3])
  if (!countStatusPrefixes.some((prefix) => cells[3].startsWith(prefix))) {
    errors.push(`FEATURESET.md: count status outside the allowed set: ${cells[3].slice(0, 60)}`)
  }
}
counts.countStatusCells = countTableStatuses.length

const catalogRows = readFileSync(join(reference, "http", "CATALOG.md"), "utf8")
  .split("\n")
  .filter((l) => /^\| [^|]+ \| [^|]+ \| [^|]+ \| (exercised|documented)/.test(l))
const doorTotal = catalogRows.length
const doorExercised = catalogRows.filter((l) => splitCells(l)[3].startsWith("exercised")).length
const doorDocumented = catalogRows.filter((l) => splitCells(l)[3].startsWith("documented")).length
const verbRows = catalogRows.filter((l) => /^\| [^|]+ \| (GET|POST|PUT|PATCH|DELETE) \|/.test(l))
const nonVerbNames = catalogRows.filter((l) => !verbRows.includes(l)).map((l) => splitCells(l)[0])
if (nonVerbNames.join(",") !== "delete,play.attach,git,openapi") errors.push(`http/CATALOG.md: non-verb rows are ${nonVerbNames.join(",")}, expected delete,play.attach,git,openapi`)
claim("FEATURESET.md", `HTTP doors ${doorTotal} = ${doorExercised} exercised + ${doorDocumented} documented; ${verbRows.length} with an HTTP verb`, "door total, status split and verb count from http/CATALOG.md")
if (rowOf("FEATURESET.md", "| HTTP doors 70").includes("gives 56")) errors.push("FEATURESET.md: stale method count 56 is still stated as a figure")
counts.doors = { total: doorTotal, exercised: doorExercised, documented: doorDocumented, verb: verbRows.length }

const manifestRows = readFileSync(join(savi, "spawn-evidence", "data", "manifests-all-results.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l))
const manifestFull = manifestRows.filter((r) => r.frames === r.hashes && r.ordered === r.frames && r.inSet === r.frames).length
claim("FEATURESET.md", `${manifestFull} of ${manifestRows.length} fully matching`, "spawn manifest corpus: fully matching frames per manifest")
claim("FEATURESET.md", "d048ad0665b46944dea920d8daed8dbe85874fb4a9d8809339e88223cd853fca", "spawn manifest exception id")
counts.manifests = { reached: manifestRows.length, fullyMatching: manifestFull }
const meDoorKeys = Object.keys(JSON.parse(readFileSync(join(reference, "http", "raw", "agent-v1-me.bearer.body"), "utf8")).doors).length
if (!/^\| me\.doors 60 keys \|.*UNVERIFIED/.test(rowOf("FEATURESET.md", "| me.doors 60 keys |"))) errors.push("FEATURESET.md: me.doors 60 must stay UNVERIFIED")
claim("FEATURESET.md", `${meDoorKeys} keys in \`doors\``, "me.doors key count from http/raw/agent-v1-me.bearer.body")

const tomeFiles = walk(join(reference, "tome"))
const tomeTop = readdirSync(join(reference, "tome"), { withFileTypes: true }).filter((e) => e.isFile()).length
const tomeSections = readdirSync(join(reference, "tome", "sections")).length
claim("FEATURESET.md", `Tome tree ${tomeFiles.length}`, "tome tree file count")
claim("FEATURESET.md", `${tomeFiles.length} files: ${tomeSections} section files, ${tomeTop} directly under`, "tome section and top-level counts")

const skillEntries = readdirSync(join(reference, "skills"))
const skillJson = skillEntries.filter((n) => n.endsWith(".json")).length
const skillMd = skillEntries.filter((n) => n.endsWith(".md")).length
const skillRows = readFileSync(join(reference, "skills", "INDEX.md"), "utf8")
  .split("\n")
  .filter((l) => /^\| /.test(l))
  .slice(1)
  .map((l) => splitCells(l))
const byteColumn = skillRows.map(([id, , , bytes]) => ({ id, column: Number(bytes), md: statSync(join(reference, "skills", `${id}.md`)).size }))
const contentBytes = skillRows.map(([id]) => ({ id, content: Buffer.byteLength(JSON.parse(readFileSync(join(reference, "skills", `${id}.json`), "utf8")).content) }))
const plusOne = byteColumn.filter((r) => r.column - r.md === 1).length
const contentMatches = contentBytes.filter((r) => r.content === byteColumn.find((b) => b.id === r.id).md).length
const cameras = byteColumn.find((r) => r.id === "cameras")
const heightmap = byteColumn.find((r) => r.id === "heightmap-terrain")
claim("FEATURESET.md", `${skillEntries.length} entries`, "skills directory entry count")
claim("FEATURESET.md", `${skillJson} \`.json\``, "skills json count")
claim("FEATURESET.md", `${skillMd} \`.md\``, "skills md count")
claim("FEATURESET.md", `for ${plusOne} rows`, "INDEX byte column offset +1 row count")
claim("FEATURESET.md", `${cameras.column}`, "cameras column value")
claim("FEATURESET.md", `${cameras.md}`, "cameras md size")
claim("FEATURESET.md", `${heightmap.column}`, "heightmap-terrain column value")
claim("FEATURESET.md", `${heightmap.md}`, "heightmap-terrain md size")
claim("FEATURESET.md", `difference 0 for all ${skillRows.length}`, "json content bytes equal md size for every served skill")
counts.skills = { served: skillRows.length, entries: skillEntries.length, json: skillJson, md: skillMd, plusOneRows: plusOne, cameras: cameras.column - cameras.md, heightmap: heightmap.column - heightmap.md, contentEqualsMd: contentMatches }
if (contentMatches !== skillRows.length) errors.push(`skills: json content differs from md for ${skillRows.length - contentMatches} rows`)

console.log(`FEATURESET CHECK FILES: ${files.length}`)
console.log(`CITED WORKSPACE PATHS: ${counts.workspacePaths}`)
console.log(`TMP REFERENCES LABELLED: ${counts.tmpReferences}`)
console.log(`REGISTER STATUS TOKENS: ${counts.registerStatusTokens}`)
console.log(`COUNT TABLE STATUS CELLS: ${counts.countStatusCells}`)
console.log(`COUNT CLAIMS CHECKED AGAINST FIXTURES: ${claimsChecked}`)
console.log(`DOORS: total ${counts.doors.total}, exercised ${counts.doors.exercised}, documented ${counts.doors.documented}, verb ${counts.doors.verb}, non-verb ${nonVerbNames.length}`)
console.log(`ME.DOORS KEYS (local body): ${meDoorKeys}`)
console.log(`TOME TREE FILES: ${tomeFiles.length} (top-level ${tomeTop}, sections ${tomeSections})`)
console.log(`SKILLS: served ${counts.skills.served}, entries ${counts.skills.entries} (json ${skillJson}, md ${skillMd}), INDEX minus md: +1 for ${plusOne}, cameras ${counts.skills.cameras}, heightmap-terrain ${counts.skills.heightmap}, content equals md for ${contentMatches}`)
console.log(`JAYZEE PINNED COMMIT: ${pin}`)
console.log(`JAYZEE RANKED ROWS AT PIN: ${counts.parityRows}`)
console.log(`GAP TABLE ROWS: ${counts.gapRows} (required-in-jayzee ${requiredRows}, built ${builtRows})`)
console.log(`SAVI-OWNED ITEMS WITH PATH CHECK: ${counts.savedItemsNeedingPath}`)
console.log(`OPEN REQUIRED ROWS WITH NO EXISTING JAYZEE TARGET (tracked, not resolved): ${openWithoutTarget.join(", ")}`)
console.log(`NAMED JAYZEE PATHS NOT CREATED (tracked, not resolved): ${namedNotCreated.join(", ")}`)
for (const error of errors) console.log(`ERROR: ${error}`)
console.log(`RESULT: ${errors.length === 0 ? "PASS" : "FAIL"}`)

if (errors.length > 0) process.exitCode = 1
