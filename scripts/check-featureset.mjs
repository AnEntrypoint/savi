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
  if ((status === "built") !== (tag === "none (built)")) errors.push(`JAYZEE-GAPS.md: row ${number} has status ${status} with tag ${tag}; a built row takes the none (built) tag and no other row does`)
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
const rankedNumbers = [...parityRows.keys()].sort((a, b) => a - b)
const numberedFromOne = (numbers) => numbers.every((n, i) => n === i + 1)
if (!numberedFromOne(rankedNumbers)) errors.push(`ranked rows at ${pin} are not numbered 1 to ${rankedNumbers.length}`)
if (numberedFromOne(rankedNumbers.filter((n) => n !== rankedNumbers[Math.floor(rankedNumbers.length / 2)]))) errors.push("negative witness failed: a register with a removed row was accepted as contiguous")
if (!numberedFromOne([...rankedNumbers, rankedNumbers.length + 1])) errors.push("negative witness failed: a register with one more row was refused")
counts.rankedNumbering = { first: rankedNumbers[0], last: rankedNumbers[rankedNumbers.length - 1], rows: rankedNumbers.length }
console.log(`RANKED NUMBERING AT jayzee ${pin}: ${rankedNumbers.length} rows numbered 1 to ${rankedNumbers.length}; removed-row negative refused: ${!numberedFromOne(rankedNumbers.filter((n) => n !== rankedNumbers[Math.floor(rankedNumbers.length / 2)]))}; N+1 row accepted: ${numberedFromOne([...rankedNumbers, rankedNumbers.length + 1])}`)
const expectedOpenWithoutTarget = []
const expectedNamedNotCreated = []
const sameList = (a, b) => a.length === b.length && a.every((n, i) => n === b[i])
if (!sameList(openWithoutTarget, expectedOpenWithoutTarget)) errors.push(`JAYZEE-GAPS.md: feature-coverage rows citing no existing jayzee path are [${openWithoutTarget.join(", ")}], expected [${expectedOpenWithoutTarget.join(", ")}]`)
if (!sameList(namedNotCreated, expectedNamedNotCreated)) errors.push(`JAYZEE-GAPS.md: open required rows citing a jayzee path not created at ${pin} are [${namedNotCreated.join(", ")}], expected [${expectedNamedNotCreated.join(", ")}]`)
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

const spointRoot = "/workspace/spoint"
const spointPin = "d5e3860"
const spointHead = execFileSync("git", ["-C", spointRoot, "rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim()
if (spointHead !== spointPin) errors.push(`spoint HEAD is ${spointHead}, expected ${spointPin}`)
const streamCitePattern = /`((?:src|client|apps|scripts|packages)\/[^`]+?):(\d+)` \(`([^`]+)`\)/g
for (const [number, expected] of [[19, 24], [20, 32], [21, 14], [22, 30], [23, 21], [24, 11], [25, 19], ["25, part 2", 17], [26, 19], [27, 19], [28, 18], [29, 17], [30, 14], [31, 7], [32, 10], [33, 14], [34, 0], [35, 4]]) {
  const section = texts["FEATURESET.md"].split(`\n## Stream ${number}`)[1]?.split("\n## ")[0] ?? ""
  const cites = [...section.matchAll(streamCitePattern)]
  let verified = 0
  for (const [, path, lineNumber, snippet] of cites) {
    claimsChecked++
    let source = null
    try { source = execFileSync("git", ["-C", spointRoot, "show", `${spointPin}:${path}`], { encoding: "utf8" }).split("\n") } catch { source = null }
    if (source === null) { errors.push(`FEATURESET.md stream ${number}: ${path} is not in spoint at ${spointPin}`); continue }
    if ((source[Number(lineNumber) - 1] ?? "").includes(snippet)) verified++
    else errors.push(`FEATURESET.md stream ${number}: ${path}:${lineNumber} does not contain the cited text: ${snippet}`)
  }
  if (cites.length !== expected) errors.push(`FEATURESET.md stream ${number}: expected ${expected} citations, found ${cites.length}`)
  counts[`stream${number}`] = { citations: cites.length, verified }
  console.log(`STREAM ${number} CITATIONS VERIFIED AGAINST spoint ${spointPin}: ${verified} of ${cites.length}`)
}
const editorFiles = execFileSync("git", ["-C", spointRoot, "ls-tree", "-r", "--name-only", spointPin, "client/editor"], { encoding: "utf8" }).split("\n").filter((p) => p.endsWith(".js") && !/\/(EditorShell|editor)\.js$|\/wm\//.test(p))
const editorLines = editorFiles.reduce((sum, p) => sum + execFileSync("git", ["-C", spointRoot, "show", `${spointPin}:${p}`], { encoding: "utf8" }).split("\n").length - 1, 0)
if (editorFiles.length !== 28 || editorLines !== 5950) errors.push(`spoint client/editor scope at ${spointPin} is ${editorFiles.length} files and ${editorLines} lines, expected 28 and 5950`)
const streamTwentyFour = texts["FEATURESET.md"].split("\n## Stream 24")[1]?.split("\n## ")[0] ?? ""
const savisDocsOutsideStreamTwentyFour = [texts["FEATURESET.md"].replace(streamTwentyFour, ""), texts["JAYZEE-GAPS.md"], texts["OPEN-ITEMS.md"]]
const editorBasenames = editorFiles.map((p) => p.split("/").pop().replace(/\.js$/, ""))
const namedInDocs = editorBasenames.filter((b) => savisDocsOutsideStreamTwentyFour.some((t) => t.includes(b))).sort()
if (namedInDocs.join() !== ["EditorEventLog", "EventChainPanel", "FreddieChatPanel", "ProcgenPanel"].join()) errors.push(`savi docs outside stream 24 name editor modules [${namedInDocs.join(", ")}], expected [EditorEventLog, EventChainPanel, FreddieChatPanel, ProcgenPanel]`)
const scriptTexts = walk(join(savi, "scripts")).filter((f) => !f.endsWith("check-featureset.mjs")).map((f) => readFileSync(f, "utf8"))
const namedInScripts = editorBasenames.filter((b) => scriptTexts.some((t) => t.includes(b)))
if (namedInScripts.length !== 0) errors.push(`savi scripts name editor modules: ${namedInScripts.join(", ")}`)
counts.stream24Cluster = { files: editorFiles.length, lines: editorLines, namedInDocs, namedInScripts: namedInScripts.length }
console.log(`STREAM 24 CLUSTER AT spoint ${spointPin}: ${editorFiles.length} files, ${editorLines} lines; savi docs outside stream 24 name ${namedInDocs.length} (disclosed); scripts name ${namedInScripts.length}`)
const serverModules = ["EditOpLog", "AgentEditServer", "PlaceInstances", "PrefabSpawner", "EditorHandlersSerialize"]
const serverLines = serverModules.reduce((sum, m) => sum + execFileSync("git", ["-C", spointRoot, "show", `${spointPin}:src/sdk/${m}.js`], { encoding: "utf8" }).split("\n").length - 1, 0)
if (serverLines !== 510) errors.push(`spoint src/sdk editor server cluster at ${spointPin} is ${serverLines} lines, expected 510`)
const placeInstancesExports = execFileSync("git", ["-C", spointRoot, "show", `${spointPin}:src/sdk/PlaceInstances.js`], { encoding: "utf8" }).split("\n").filter((l) => l.startsWith("export")).length
if (placeInstancesExports !== 4) errors.push(`PlaceInstances.js at ${spointPin} has ${placeInstancesExports} exports, expected 4`)
const streamTwentyFive = texts["FEATURESET.md"].split("\n## Stream 25")[1]?.split("\n## ")[0] ?? ""
const docsOutsideStreamTwentyFive = [texts["FEATURESET.md"].replace(streamTwentyFive, ""), texts["JAYZEE-GAPS.md"], texts["OPEN-ITEMS.md"], readFileSync(join(docs, "PARITY-INPUTS.md"), "utf8")]
const serverNamedInDocs = serverModules.filter((m) => docsOutsideStreamTwentyFive.some((t) => t.includes(m)))
if (serverNamedInDocs.length !== 0) errors.push(`savi docs outside stream 25 name server modules: ${serverNamedInDocs.join(", ")}`)
const serverNamedInScripts = serverModules.filter((m) => scriptTexts.some((t) => t.includes(m)))
if (serverNamedInScripts.length !== 0) errors.push(`savi scripts name server modules: ${serverNamedInScripts.join(", ")}`)
counts.stream25Cluster = { lines: serverLines, namedInDocs: serverNamedInDocs.length, namedInScripts: serverNamedInScripts.length }
console.log(`STREAM 25 CLUSTER AT spoint ${spointPin}: ${serverLines} lines; savi docs outside stream 25 name ${serverNamedInDocs.length}; scripts name ${serverNamedInScripts.length}`)
const serverPartTwo = ["AppManifest", "ChaseCamera", "DevAppModuleVersions", "DevHmrGraph", "FreddieBridge", "PublicBenchmark", "ReloadHandlers", "ReloadManager", "RoomLog", "RoomProcessWorker", "ServerIdentity", "ServerTimeOfDay", "SharedEventEnvelope", "TextureAtlas", "WorkerBoot", "appEventSender", "scatterSpec"]
const partTwoText = (m) => execFileSync("git", ["-C", spointRoot, "show", `${spointPin}:src/sdk/${m}.js`], { encoding: "utf8" })
const partTwoLines = serverPartTwo.reduce((sum, m) => sum + partTwoText(m).split("\n").length - 1, 0)
if (partTwoLines !== 1171) errors.push(`spoint src/sdk stream 25 part 2 at ${spointPin} is ${partTwoLines} lines, expected 1171`)
const partTwoExports = serverPartTwo.reduce((sum, m) => sum + partTwoText(m).split("\n").filter((l) => l.startsWith("export")).length, 0)
if (partTwoExports !== 41) errors.push(`spoint src/sdk stream 25 part 2 at ${spointPin} has ${partTwoExports} exports, expected 41`)
const importersOf = (m) => { try { return execFileSync("git", ["-C", spointRoot, "grep", "-lF", m, spointPin, "--", "src", "client", "apps", "packages", "scripts", "bin", "edge", `:!src/sdk/${m}.js`], { encoding: "utf8" }).split("\n").filter(Boolean) } catch { return [] } }
for (const m of ["ChaseCamera", "RoomLog", "SharedEventEnvelope", "scatterSpec"]) if (importersOf(m).length !== 0) errors.push(`${m} has code importers at ${spointPin}, expected none`)
const partTwoSection = texts["FEATURESET.md"].split("\n## Stream 25, part 2")[1]?.split("\n## ")[0] ?? ""
const partTwoDocsOutside = [texts["FEATURESET.md"].replace(partTwoSection, ""), texts["JAYZEE-GAPS.md"], texts["OPEN-ITEMS.md"], readFileSync(join(docs, "PARITY-INPUTS.md"), "utf8")]
const partTwoNamedInDocs = serverPartTwo.filter((m) => partTwoDocsOutside.some((t) => t.includes(m)))
if (partTwoNamedInDocs.length !== 0) errors.push(`savi docs outside stream 25 part 2 name part-2 modules: ${partTwoNamedInDocs.join(", ")}`)
const partTwoNamedInScripts = serverPartTwo.filter((m) => scriptTexts.some((t) => t.includes(m)))
if (partTwoNamedInScripts.length !== 0) errors.push(`savi scripts name part-2 modules: ${partTwoNamedInScripts.join(", ")}`)
counts.stream25PartTwo = { lines: partTwoLines, exports: partTwoExports, namedInDocs: partTwoNamedInDocs.length, namedInScripts: partTwoNamedInScripts.length }
console.log(`STREAM 25 PART 2 AT spoint ${spointPin}: ${partTwoLines} lines, ${partTwoExports} exports; savi docs name ${partTwoNamedInDocs.length}; scripts name ${partTwoNamedInScripts.length}`)
const behaviourModules = ["buoyancy", "cameraRig", "checkpoint", "decisionPipe", "decisionRuntime", "destructibleSpec", "fluid3d", "game-fsm", "gamemode", "pickup", "projectile", "projectileGravity", "shrinking-zone", "specBoundary", "steering", "teams", "trade", "voxels", "weapon"]
const behaviourText = (m) => execFileSync("git", ["-C", spointRoot, "show", `${spointPin}:src/behaviours/${m}.js`], { encoding: "utf8" })
const behaviourLines = behaviourModules.reduce((sum, m) => sum + behaviourText(m).split("\n").length - 1, 0)
if (behaviourLines !== 2210) errors.push(`spoint src/behaviours stream 26 at ${spointPin} is ${behaviourLines} lines, expected 2210`)
const behaviourExports = behaviourModules.reduce((sum, m) => sum + behaviourText(m).split("\n").filter((l) => l.startsWith("export")).length, 0)
if (behaviourExports !== 46) errors.push(`spoint src/behaviours stream 26 at ${spointPin} has ${behaviourExports} exports, expected 46`)
const projectileImporters = (() => { try { return execFileSync("git", ["-C", spointRoot, "grep", "-lE", "behaviours/projectile\\.js['\"]|'\\./projectile\\.js'", spointPin, "--", "src", "client", "apps", "packages", "scripts", "bin", "edge"], { encoding: "utf8" }).split("\n").filter(Boolean) } catch { return [] } })()
if (projectileImporters.length !== 0) errors.push(`projectile.js has exact-path importers at ${spointPin}: ${projectileImporters.join(", ")}`)
const behaviourSection = texts["FEATURESET.md"].split("\n## Stream 26")[1]?.split("\n## ")[0] ?? ""
const docsOutsideStreamTwentySix = [texts["FEATURESET.md"].replace(behaviourSection, ""), texts["JAYZEE-GAPS.md"], texts["OPEN-ITEMS.md"], readFileSync(join(docs, "PARITY-INPUTS.md"), "utf8")]
const behaviourNamedInDocs = behaviourModules.filter((m) => docsOutsideStreamTwentySix.some((t) => new RegExp(`\\b${m}\\b`).test(t)))
if (behaviourNamedInDocs.join() !== ["steering"].join()) errors.push(`savi docs outside stream 26 name behaviour modules [${behaviourNamedInDocs.join(", ")}], expected [steering] (stream 27 importer citation)`)
const scriptJsTexts = walk(join(savi, "scripts")).filter((f) => /\.(mjs|js)$/.test(f) && !f.endsWith("check-featureset.mjs")).map((f) => readFileSync(f, "utf8"))
const behaviourNamedInScripts = behaviourModules.filter((m) => scriptJsTexts.some((t) => new RegExp(`\\b${m}\\b`).test(t)))
if (behaviourNamedInScripts.length !== 0) errors.push(`savi scripts name behaviour modules: ${behaviourNamedInScripts.join(", ")}`)
counts.stream26 = { lines: behaviourLines, exports: behaviourExports, namedInDocs: behaviourNamedInDocs.length, namedInScripts: behaviourNamedInScripts.length }
console.log(`STREAM 26 AT spoint ${spointPin}: ${behaviourLines} lines, ${behaviourExports} exports, projectile importers ${projectileImporters.length}; savi docs name ${behaviourNamedInDocs.length}; scripts name ${behaviourNamedInScripts.length}`)
const appModules = ["AccountState", "AppBehaviours", "AppGameplay", "AppLoader", "AppPhysics", "AppRuntimePhysics", "AppRuntimeState", "AppRuntimeStaticMotion", "AppRuntimeTick", "AppSeats", "ComponentPool", "CustomVersion", "EcsEntityMap", "EventBus", "HotReloadQueue", "SurfaceSelector", "SurfaceSelectorRuntime", "appImports", "appsManifest"]
const appText = (m) => execFileSync("git", ["-C", spointRoot, "show", `${spointPin}:src/apps/${m}.js`], { encoding: "utf8" })
const appLines = appModules.reduce((sum, m) => sum + appText(m).split("\n").length - 1, 0)
if (appLines !== 2545) errors.push(`spoint src/apps stream 27 at ${spointPin} is ${appLines} lines, expected 2545`)
const appExports = appModules.reduce((sum, m) => sum + appText(m).split("\n").filter((l) => l.startsWith("export")).length, 0)
if (appExports !== 54) errors.push(`spoint src/apps stream 27 at ${spointPin} has ${appExports} exports, expected 54`)
const appsWithNoWitness = ["AccountState", "AppBehaviours", "AppGameplay", "AppPhysics", "AppRuntimePhysics", "AppRuntimeState", "AppRuntimeStaticMotion", "AppRuntimeTick", "AppSeats", "ComponentPool", "CustomVersion", "EcsEntityMap", "EventBus", "HotReloadQueue", "SurfaceSelector"]
for (const m of appsWithNoWitness) {
  const hits = (() => { try { return execFileSync("git", ["-C", spointRoot, "grep", "-lE", `/${m}\\.js['"]`, spointPin, "--", "scripts/*.mjs", "scripts/*.js"], { encoding: "utf8" }).split("\n").filter(Boolean) } catch { return [] } })()
  if (hits.length !== 0) errors.push(`${m} has a witness script at ${spointPin}: ${hits.join(", ")}`)
}
const appSection = texts["FEATURESET.md"].split("\n## Stream 27")[1]?.split("\n## ")[0] ?? ""
const docsOutsideStreamTwentySeven = [texts["FEATURESET.md"].replace(appSection, ""), texts["JAYZEE-GAPS.md"], texts["OPEN-ITEMS.md"], readFileSync(join(docs, "PARITY-INPUTS.md"), "utf8")]
const appNamedInDocs = appModules.filter((m) => docsOutsideStreamTwentySeven.some((t) => new RegExp(`\\b${m}\\b`).test(t)))
if (appNamedInDocs.join() !== ["AppBehaviours"].join()) errors.push(`savi docs outside stream 27 name app modules [${appNamedInDocs.join(", ")}], expected [AppBehaviours] (stream 26 importer citations)`)
const appNamedInScripts = appModules.filter((m) => scriptJsTexts.some((t) => new RegExp(`\\b${m}\\b`).test(t)))
if (appNamedInScripts.length !== 0) errors.push(`savi scripts name app modules: ${appNamedInScripts.join(", ")}`)
counts.stream27 = { lines: appLines, exports: appExports, namedInDocs: appNamedInDocs, namedInScripts: appNamedInScripts.length }
console.log(`STREAM 27 AT spoint ${spointPin}: ${appLines} lines, ${appExports} exports; witness-less negatives refused: ${appsWithNoWitness.length}; savi docs name ${appNamedInDocs.join(",")} (disclosed); scripts name ${appNamedInScripts.length}`)
const streamTwentyEightModules = ["ServerBoot", "StaticCache"]
const streamTwentyEightLines = streamTwentyEightModules.reduce((sum, m) => sum + execFileSync("git", ["-C", spointRoot, "show", `${spointPin}:src/sdk/${m}.js`], { encoding: "utf8" }).split("\n").length - 1, 0)
if (streamTwentyEightLines !== 684) errors.push(`spoint ServerBoot and StaticCache at ${spointPin} are ${streamTwentyEightLines} lines, expected 684`)
const streamTwentyEightExports = streamTwentyEightModules.reduce((sum, m) => sum + execFileSync("git", ["-C", spointRoot, "show", `${spointPin}:src/sdk/${m}.js`], { encoding: "utf8" }).split("\n").filter((l) => l.startsWith("export")).length, 0)
if (streamTwentyEightExports !== 33) errors.push(`spoint ServerBoot and StaticCache at ${spointPin} have ${streamTwentyEightExports} exports, expected 33`)
const staticCacheImporters = (() => { try { return execFileSync("git", ["-C", spointRoot, "grep", "-lE", "/StaticCache\\.js['\"]|'\\./StaticCache\\.js'", spointPin, "--", "src", "client", "apps", "packages", "scripts", "bin", "edge"], { encoding: "utf8" }).split("\n").filter(Boolean).map((l) => l.replace(`${spointPin}:`, "")) } catch { return [] } })()
if (staticCacheImporters.join() !== "src/sdk/StaticHandler.js") errors.push(`StaticCache.js importers at ${spointPin} are [${staticCacheImporters.join(", ")}], expected [src/sdk/StaticHandler.js]`)
const streamTwentyEightWitnesses = (() => { try { return execFileSync("git", ["-C", spointRoot, "grep", "-lE", "StaticCache|ServerBoot", spointPin, "--", "scripts"], { encoding: "utf8" }).split("\n").filter(Boolean) } catch { return [] } })()
if (streamTwentyEightWitnesses.length !== 0) errors.push(`ServerBoot or StaticCache has a witness script at ${spointPin}: ${streamTwentyEightWitnesses.join(", ")}`)
const streamTwentyEightNamedInDocs = streamTwentyEightModules.filter((m) => [texts["JAYZEE-GAPS.md"], texts["OPEN-ITEMS.md"], readFileSync(join(docs, "PARITY-INPUTS.md"), "utf8")].some((t) => new RegExp(`\\b${m}\\b`).test(t)))
if (streamTwentyEightNamedInDocs.length !== 0) errors.push(`savi JAYZEE-GAPS, OPEN-ITEMS or PARITY-INPUTS name stream 28 modules: ${streamTwentyEightNamedInDocs.join(", ")}`)
const streamTwentyEightNamedInScripts = streamTwentyEightModules.filter((m) => scriptJsTexts.some((t) => new RegExp(`\\b${m}\\b`).test(t)))
if (streamTwentyEightNamedInScripts.length !== 0) errors.push(`savi scripts name stream 28 modules: ${streamTwentyEightNamedInScripts.join(", ")}`)
counts.stream28 = { lines: streamTwentyEightLines, exports: streamTwentyEightExports, importersStaticCache: staticCacheImporters.length, witnesses: streamTwentyEightWitnesses.length }
console.log(`STREAM 28 AT spoint ${spointPin}: ${streamTwentyEightLines} lines, ${streamTwentyEightExports} exports, StaticCache importers ${staticCacheImporters.length}, witnesses ${streamTwentyEightWitnesses.length}`)
const hudModules = ["Chat", "ChatQuickWheel", "EmoteWheel", "HudStats", "MeshDebugPanel", "MinimapGlyphs", "MinimapHUD", "MinimapModels", "MinimapPlacements", "MobileControlsUI", "PauseMenu", "RenderDebugPanel", "SettingsMenu", "VoiceIndicator", "createLoadingScreen", "createLobby", "ensureStyle"]
const hudText = (m) => execFileSync("git", ["-C", spointRoot, "show", `${spointPin}:client/hud/${m}.js`], { encoding: "utf8" })
const hudLines = hudModules.reduce((sum, m) => sum + hudText(m).split("\n").length - 1, 0)
if (hudLines !== 2254) errors.push(`spoint client/hud stream 29 at ${spointPin} is ${hudLines} lines, expected 2254`)
const hudExports = hudModules.reduce((sum, m) => sum + hudText(m).split("\n").filter((l) => l.startsWith("export")).length, 0)
if (hudExports !== 31) errors.push(`spoint client/hud stream 29 at ${spointPin} has ${hudExports} exports, expected 31`)
const hudWitnesses = hudModules.filter((m) => { try { return execFileSync("git", ["-C", spointRoot, "grep", "-lwF", m, spointPin, "--", "scripts"], { encoding: "utf8" }).trim().length > 0 } catch { return false } })
if (hudWitnesses.length !== 0) errors.push(`client/hud modules have witness scripts at ${spointPin}: ${hudWitnesses.join(", ")}`)
const hudSection = texts["FEATURESET.md"].split("\n## Stream 29")[1]?.split("\n## ")[0] ?? ""
const docsOutsideStreamTwentyNine = [texts["FEATURESET.md"].replace(hudSection, ""), texts["JAYZEE-GAPS.md"], texts["OPEN-ITEMS.md"], readFileSync(join(docs, "PARITY-INPUTS.md"), "utf8")]
const hudNamedInDocs = hudModules.filter((m) => docsOutsideStreamTwentyNine.some((t) => new RegExp(`\\b${m}\\b`).test(t)))
if (hudNamedInDocs.length !== 0) errors.push(`savi docs outside stream 29 name client/hud modules: ${hudNamedInDocs.join(", ")}`)
const hudNamedInScripts = hudModules.filter((m) => scriptJsTexts.some((t) => new RegExp(`\\b${m}\\b`).test(t)))
if (hudNamedInScripts.length !== 0) errors.push(`savi scripts name client/hud modules: ${hudNamedInScripts.join(", ")}`)
counts.stream29 = { lines: hudLines, exports: hudExports, namedInDocs: hudNamedInDocs.length, namedInScripts: hudNamedInScripts.length }
console.log(`STREAM 29 AT spoint ${spointPin}: ${hudLines} lines, ${hudExports} exports, witnesses ${hudWitnesses.length}; savi docs name ${hudNamedInDocs.length}; scripts name ${hudNamedInScripts.length}`)
const chartMigratorModules = ["migratePlayers", "migrateWorldAnchors"]
const chartMigratorText = (m) => execFileSync("git", ["-C", spointRoot, "show", `${spointPin}:src/sdk/chartState/${m}.js`], { encoding: "utf8" })
const chartMigratorLines = chartMigratorModules.reduce((sum, m) => sum + chartMigratorText(m).split("\n").length - 1, 0)
if (chartMigratorLines !== 78) errors.push(`chartState migrators at ${spointPin} are ${chartMigratorLines} lines, expected 78`)
const chartMigratorWitnesses = chartMigratorModules.filter((m) => { try { return execFileSync("git", ["-C", spointRoot, "grep", "-l", m, spointPin, "--", "scripts"], { encoding: "utf8" }).trim().length > 0 } catch { return false } })
if (chartMigratorWitnesses.length !== 0) errors.push(`chartState migrators have witness scripts at ${spointPin}: ${chartMigratorWitnesses.join(", ")}`)
counts.chartStateMigrators = { lines: chartMigratorLines, witnesses: chartMigratorWitnesses.length }
console.log(`CHARTSTATE MIGRATORS AT spoint ${spointPin}: ${chartMigratorLines} lines; witnesses ${chartMigratorWitnesses.length}`)
const chartAddendum = texts["FEATURESET.md"].split("\n## chartState per-file migrators")[1]?.split("\n## ")[0] ?? ""
const chartCites = [...chartAddendum.matchAll(streamCitePattern)]
let chartVerified = 0
for (const [, path, lineNumber, snippet] of chartCites) {
  claimsChecked++
  let source = null
  try { source = execFileSync("git", ["-C", spointRoot, "show", `${spointPin}:${path}`], { encoding: "utf8" }).split("\n") } catch { source = null }
  if (source === null) { errors.push(`FEATURESET.md chartState addendum: ${path} is not in spoint at ${spointPin}`); continue }
  if ((source[Number(lineNumber) - 1] ?? "").includes(snippet)) chartVerified++
  else errors.push(`FEATURESET.md chartState addendum: ${path}:${lineNumber} does not contain the cited text: ${snippet}`)
}
if (chartCites.length !== 4) errors.push(`FEATURESET.md chartState addendum: expected 4 citations, found ${chartCites.length}`)
console.log(`CHARTSTATE ADDENDUM CITATIONS VERIFIED AGAINST spoint ${spointPin}: ${chartVerified} of ${chartCites.length}`)
const procgenModules = ["LSystem", "NoiseTerrain", "TextureScript", "WFC"]
const procgenText = (m) => execFileSync("git", ["-C", spointRoot, "show", `${spointPin}:src/procgen/${m}.js`], { encoding: "utf8" })
const procgenLines = procgenModules.reduce((sum, m) => sum + procgenText(m).split("\n").length - 1, 0)
if (procgenLines !== 563) errors.push(`spoint src/procgen stream 30 at ${spointPin} is ${procgenLines} lines, expected 563`)
const procgenExports = procgenModules.reduce((sum, m) => sum + procgenText(m).split("\n").filter((l) => l.startsWith("export")).length, 0)
if (procgenExports !== 13) errors.push(`spoint src/procgen stream 30 at ${spointPin} has ${procgenExports} exports, expected 13`)
const procgenWitnesses = ["LSystem", "NoiseTerrain", "TextureScript", "WFC", "procgen"].filter((m) => { try { return execFileSync("git", ["-C", spointRoot, "grep", "-liwF", m, spointPin, "--", "scripts"], { encoding: "utf8" }).trim().length > 0 } catch { return false } })
if (procgenWitnesses.length !== 0) errors.push(`procgen names have witness scripts at ${spointPin}: ${procgenWitnesses.join(", ")}`)
const procgenSection = texts["FEATURESET.md"].split("\n## Stream 30")[1]?.split("\n## ")[0] ?? ""
const procgenDocsOutside = [texts["FEATURESET.md"].replace(procgenSection, ""), texts["JAYZEE-GAPS.md"], texts["OPEN-ITEMS.md"], readFileSync(join(docs, "PARITY-INPUTS.md"), "utf8")]
const procgenNamedInDocs = procgenModules.filter((m) => procgenDocsOutside.some((t) => new RegExp(`\\b${m}\\b`).test(t)))
if (procgenNamedInDocs.length !== 0) errors.push(`savi docs outside stream 30 name procgen modules: ${procgenNamedInDocs.join(", ")}`)
const procgenNamedInScripts = procgenModules.filter((m) => scriptJsTexts.some((t) => new RegExp(`\\b${m}\\b`).test(t)))
if (procgenNamedInScripts.length !== 0) errors.push(`savi scripts name procgen modules: ${procgenNamedInScripts.join(", ")}`)
counts.stream30 = { lines: procgenLines, exports: procgenExports, namedInDocs: procgenNamedInDocs.length, namedInScripts: procgenNamedInScripts.length }
console.log(`STREAM 30 AT spoint ${spointPin}: ${procgenLines} lines, ${procgenExports} exports, witnesses ${procgenWitnesses.length}; savi docs name ${procgenNamedInDocs.length}; scripts name ${procgenNamedInScripts.length}`)
const effectsModules = ["DamageEffects", "fxProgram"]
const effectsText = (m) => execFileSync("git", ["-C", spointRoot, "show", `${spointPin}:src/effects/${m}.js`], { encoding: "utf8" })
const effectsLines = effectsModules.reduce((sum, m) => sum + effectsText(m).split("\n").length - 1, 0)
if (effectsLines !== 275) errors.push(`spoint src/effects stream 31 at ${spointPin} is ${effectsLines} lines, expected 275`)
const effectsExports = effectsModules.reduce((sum, m) => sum + effectsText(m).split("\n").filter((l) => l.startsWith("export")).length, 0)
if (effectsExports !== 4) errors.push(`spoint src/effects stream 31 at ${spointPin} has ${effectsExports} exports, expected 4`)
const fxProgramImporters = (() => { try { return execFileSync("git", ["-C", spointRoot, "grep", "-lE", "fxProgram", spointPin, "--", ":!src/effects/fxProgram.js"], { encoding: "utf8" }).split("\n").filter(Boolean) } catch { return [] } })()
if (fxProgramImporters.length !== 0) errors.push(`fxProgram has references at ${spointPin} outside its own file: ${fxProgramImporters.join(", ")}`)
const effectsWitnesses = effectsModules.filter((m) => { try { return execFileSync("git", ["-C", spointRoot, "grep", "-lwF", m, spointPin, "--", "scripts"], { encoding: "utf8" }).trim().length > 0 } catch { return false } })
if (effectsWitnesses.length !== 0) errors.push(`effects modules have witness scripts at ${spointPin}: ${effectsWitnesses.join(", ")}`)
const effectsSection = texts["FEATURESET.md"].split("\n## Stream 31")[1]?.split("\n## ")[0] ?? ""
const effectsDocsOutside = [texts["FEATURESET.md"].replace(effectsSection, ""), texts["JAYZEE-GAPS.md"], texts["OPEN-ITEMS.md"], readFileSync(join(docs, "PARITY-INPUTS.md"), "utf8")]
const effectsNamedInDocs = effectsModules.filter((m) => effectsDocsOutside.some((t) => new RegExp(`\\b${m}\\b`).test(t)))
if (effectsNamedInDocs.length !== 0) errors.push(`savi docs outside stream 31 name effects modules: ${effectsNamedInDocs.join(", ")}`)
const effectsNamedInScripts = effectsModules.filter((m) => scriptJsTexts.some((t) => new RegExp(`\\b${m}\\b`).test(t)))
if (effectsNamedInScripts.length !== 0) errors.push(`savi scripts name effects modules: ${effectsNamedInScripts.join(", ")}`)
counts.stream31 = { lines: effectsLines, exports: effectsExports, namedInDocs: effectsNamedInDocs.length, namedInScripts: effectsNamedInScripts.length }
console.log(`STREAM 31 AT spoint ${spointPin}: ${effectsLines} lines, ${effectsExports} exports, fxProgram references ${fxProgramImporters.length}, witnesses ${effectsWitnesses.length}; savi docs name ${effectsNamedInDocs.length}; scripts name ${effectsNamedInScripts.length}`)
const spointShow = (path) => execFileSync("git", ["-C", spointRoot, "show", `${spointPin}:${path}`], { encoding: "utf8" })
const spointWitnessFiles = (name) => { try { return execFileSync("git", ["-C", spointRoot, "grep", "-lwF", name, spointPin, "--", "scripts"], { encoding: "utf8" }).split("\n").filter(Boolean).map((l) => l.replace(`${spointPin}:`, "")) } catch { return [] } }
const spointLineCount = (path) => spointShow(path).split("\n").length - 1
const spointExportCount = (path) => spointShow(path).split("\n").filter((l) => l.startsWith("export")).length
const newStreamsSpan = texts["FEATURESET.md"].slice(texts["FEATURESET.md"].indexOf("\n## Stream 32"), texts["FEATURESET.md"].indexOf("\n## Stream 21"))
const newStreamsOutsideText = [texts["FEATURESET.md"].replace(newStreamsSpan, ""), texts["JAYZEE-GAPS.md"], texts["OPEN-ITEMS.md"], readFileSync(join(docs, "PARITY-INPUTS.md"), "utf8"), ...scriptJsTexts]
const saviNamesModule = (name) => newStreamsOutsideText.some((t) => new RegExp(`\\b${name}\\b`, "i").test(t))
const s32 = ["DracoDecompressor", "GLBLoader", "GLBMath", "MeshoptDecompressor", "pivotTransform", "surfaceVelocity"]
const s32Lines = s32.reduce((sum, m) => sum + spointLineCount(`src/physics/${m}.js`), 0)
if (s32Lines !== 508) errors.push(`stream 32 at ${spointPin}: ${s32Lines} lines, expected 508`)
const s32Exports = s32.reduce((sum, m) => sum + spointExportCount(`src/physics/${m}.js`), 0)
if (s32Exports !== 20) errors.push(`stream 32 at ${spointPin}: ${s32Exports} exports, expected 20`)
const s32NonBakeWitnessed = s32.filter((m) => spointWitnessFiles(m).some((f) => !f.includes("bake-")))
if (s32NonBakeWitnessed.join() !== "pivotTransform,surfaceVelocity") errors.push(`stream 32 witnessed set is [${s32NonBakeWitnessed.join(", ")}], expected [pivotTransform, surfaceVelocity]`)
const s32BakeOnly = s32.filter((m) => { const w = spointWitnessFiles(m); return w.length > 0 && w.every((f) => f.includes("bake-")) })
if (s32BakeOnly.join() !== "GLBLoader,GLBMath") errors.push(`stream 32 bake-only names are [${s32BakeOnly.join(", ")}], expected [GLBLoader, GLBMath]`)
const s32Named = s32.filter(saviNamesModule)
if (s32Named.length !== 0) errors.push(`savi docs or scripts outside streams 32 to 35 name stream 32 modules: ${s32Named.join(", ")}`)
const s32NegativeWitnessRefused = spointWitnessFiles("NoSuchPhysicsModuleForNegativeWitness").length === 0
if (!s32NegativeWitnessRefused) errors.push("stream 32 negative witness was not refused")
counts.stream32Physics = { lines: s32Lines, exports: s32Exports, nonBakeWitnessed: s32NonBakeWitnessed.length, bakeOnly: s32BakeOnly.join("+") }
console.log(`STREAM 32 AT spoint ${spointPin}: ${s32Lines} lines, ${s32Exports} exports, non-bake witnessed ${s32NonBakeWitnessed.join("+")}, bake-only ${s32BakeOnly.join("+")}, negative witness refused: ${s32NegativeWitnessRefused}`)
const s33 = ["MinimapBiome", "SpawnSurface", "ballistics", "bookmarks", "canonicalJSON", "clusterAssignment", "colliderLattice", "equipment", "materialSlots", "modelLoadErrors", "relevanceRadius", "vec3", "worldPresets", "worldResolve"]
const s33Lines = s33.reduce((sum, m) => sum + spointLineCount(`src/shared/${m}.js`), 0)
if (s33Lines !== 1074) errors.push(`stream 33 at ${spointPin}: ${s33Lines} lines, expected 1074`)
const s33Named = s33.filter(saviNamesModule)
if (s33Named.length !== 0) errors.push(`savi docs or scripts outside streams 32 to 35 name stream 33 modules: ${s33Named.join(", ")}`)
const s33WitnessLess = s33.filter((m) => spointWitnessFiles(m).length === 0)
if (s33WitnessLess.join() !== "SpawnSurface,bookmarks,canonicalJSON,clusterAssignment,materialSlots") errors.push(`stream 33 witness-less set is [${s33WitnessLess.join(", ")}], expected five`)
console.log(`STREAM 33 AT spoint ${spointPin}: ${s33Lines} lines, 14 modules, savi names ${s33Named.length}, witness-less ${s33WitnessLess.length}`)
const s34 = ["create-app", "create-project", "marketplace-install", "marketplace-registry", "room-orchestrator-boot", "room-worker-boot", "router-boot", "templates"]
const s34Lines = s34.reduce((sum, m) => sum + spointLineCount(`bin/${m}.js`), 0)
if (s34Lines !== 1313) errors.push(`stream 34 at ${spointPin}: ${s34Lines} lines, expected 1313`)
const s34Named = ["create-app", "create-project", "room-orchestrator-boot", "room-worker-boot"].filter(saviNamesModule)
if (s34Named.length !== 0) errors.push(`savi docs or scripts outside streams 32 to 35 name stream 34 boot scripts: ${s34Named.join(", ")}`)
const s34NoScriptWitness = ["marketplace-install", "marketplace-registry", "room-worker-boot"].filter((m) => spointWitnessFiles(m).length === 0)
if (s34NoScriptWitness.length !== 3) errors.push(`stream 34 no-script-witness set is [${s34NoScriptWitness.join(", ")}], expected three`)
console.log(`STREAM 34 AT spoint ${spointPin}: ${s34Lines} lines, 8 files, savi names ${s34Named.length}`)
const s35 = ["GrassClump", "GrassMaterial", "GrassTSL", "GrassWindField"]
const s35Lines = s35.reduce((sum, m) => sum + spointLineCount(`client/core/${m}.js`), 0)
if (s35Lines !== 832) errors.push(`stream 35 at ${spointPin}: ${s35Lines} lines, expected 832`)
const s35Witnessed = s35.filter((m) => spointWitnessFiles(m).length > 0)
if (s35Witnessed.join() !== "GrassWindField") errors.push(`stream 35 witnessed set is [${s35Witnessed.join(", ")}], expected [GrassWindField]`)
const s35Named = s35.filter(saviNamesModule)
if (s35Named.length !== 0) errors.push(`savi docs or scripts outside streams 32 to 35 name stream 35 modules: ${s35Named.join(", ")}`)
console.log(`STREAM 35 AT spoint ${spointPin}: ${s35Lines} lines, witnessed ${s35Witnessed.join("+")}, savi names ${s35Named.length}`)
const improvementCandidates = [
  ["src/shared/SpawnSurface.js", 68, "Number.isFinite(terrainY) ? Math.max(pose[1], terrainY) : pose[1]"],
  ["src/shared/colliderLattice.js", 10, "return typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : null"],
  ["src/shared/colliderLattice.js", 19, "const extent = positiveFinite('physics.extent', tphys.extent) ?? COLLIDER_DEFAULT_EXTENT_M"],
  ["src/shared/MinimapBiome.js", 38, "if (!Number.isFinite(h)) { out[0] = 0; out[1] = 0; out[2] = 0; out[3] = 0; return null }"],
  ["bin/room-orchestrator-boot.js", 14, "const workerCount = parseInt(process.env.ROOM_WORKER_COUNT || '2', 10)"],
  ["bin/room-worker-boot.js", 59, "const workerCommandPort = parseInt(process.env.WORKER_COMMAND_PORT || '0', 10)"],
  ["bin/router-boot.js", 25, "const cellSize = parseInt(process.env.SHARD_CELL_SIZE || String(shardCfg.cellSize ?? 0), 10) || undefined"],
  ["bin/marketplace-registry.js", 7, "const PORT = parseInt(process.env.PORT || '3100', 10)"],
  ["bin/marketplace-install.js", 17, "let registryUrl = process.env.MARKETPLACE_REGISTRY || 'http://localhost:3100'"],
  ["client/core/GrassTSL.js", 33, "const d = density || GRASS_DENSITY"],
  ["client/core/GrassMaterial.js", 152, "const d = density || GRASS_DENSITY"],
  ["client/core/GrassMaterial.js", 117, "return Number.isFinite(v) ? v : fallback"],
  ["client/core/GrassClump.js", 73, "const N = Number.isFinite(segments) && segments >= 1 ? segments | 0 : 3"],
  ["client/core/GrassClump.js", 74, "const C = Number.isFinite(cards) && cards >= 1 ? cards | 0 : 3"],
  ["client/core/GrassWindField.js", 137, "const r = Number.isFinite(reach) && reach > 0 ? reach : GRASS_WIND_FIELD_REACH_M"],
]
const candidateMismatch = improvementCandidates.filter(([p, n, s]) => !spointShow(p).split("\n")[n - 1]?.includes(s))
if (candidateMismatch.length !== 0) errors.push(`improvement candidates not at their cited lines at ${spointPin}: ${candidateMismatch.map(([p, n]) => `${p}:${n}`).join(", ")}`)
const candidateShiftRefused = improvementCandidates.filter(([p, n, s]) => spointShow(p).split("\n")[n]?.includes(s)).length === 0
if (!candidateShiftRefused) errors.push("improvement candidate line-shift negative was not refused")
console.log(`IMPROVEMENT CANDIDATES AT spoint ${spointPin}: ${improvementCandidates.length} located, line-shift negative refused: ${candidateShiftRefused}`)
const cavePresentAtPin = (() => { try { execFileSync("git", ["-C", spointRoot, "cat-file", "-e", `${spointPin}:src/terrain/CaveMeshes.js`]); return true } catch { return false } })()
if (cavePresentAtPin) errors.push("spoint: src/terrain/CaveMeshes.js exists at the pin, so the CaveMeshes correction is wrong")
const cavePatchesImporters = (() => { try { return execFileSync("git", ["-C", spointRoot, "grep", "-l", "CavePatches", spointPin, "--", "src", "client", "apps", "packages", "edge", "scripts"], { encoding: "utf8" }).split("\n").filter(Boolean).length } catch { return 0 } })()
if (cavePatchesImporters !== 0) errors.push(`spoint: CavePatches has ${cavePatchesImporters} files outside .gm, expected 0`)
for (const file of ["FEATURESET.md", "JAYZEE-GAPS.md", "PARITY-INPUTS.md"]) {
  const body = readFileSync(join(docs, file), "utf8")
  if (body.includes("CavePatches/CaveMeshes") || body.includes("CavePatches, CaveMeshes")) errors.push(`${file}: CaveMeshes is still listed under src/terrain`)
  if (!body.includes("client/core/CaveMeshes")) errors.push(`${file}: the CaveMeshes correction is missing`)
}
const denominatorSection = texts["FEATURESET.md"].split("\n## Scoped spawn decoded-frame token scan")[1]?.split("\n## ")[0] ?? ""
const denominatorPatterns = {
  textVisibleKeys: /(\d+) text-visible keys/,
  uniqueDecodedKeys: /(\d+) unique decoded-frame `world\.assets` keys/,
  manifestsReached: /(\d+) manifests reached/,
  worldsWithCdnGlb: /(\d+) worlds with `\/cdn\/` GLB references/,
}
const readDenominators = (text) => Object.fromEntries(Object.entries(denominatorPatterns).map(([name, pattern]) => [name, Number((text.match(pattern) ?? [])[1])]))
const hasMergedDenominators = (values) => new Set(Object.values(values)).size !== Object.values(values).length
const denominators = readDenominators(denominatorSection)
if (Object.values(denominators).some((value) => !(value > 0))) errors.push(`FEATURESET.md: a denominator is missing from the decoded-frame section: ${JSON.stringify(denominators)}`)
if (hasMergedDenominators(denominators)) errors.push(`FEATURESET.md: denominators are merged: ${JSON.stringify(denominators)}`)
const mergedWitness = readDenominators(denominatorSection.replace("307 text-visible keys", "11987 text-visible keys"))
if (!hasMergedDenominators(mergedWitness)) errors.push("negative witness failed: merging two denominators was not refused")
console.log(`FOUR DENOMINATORS DISTINCT: ${Object.values(denominators).join(", ")}; merge negative refused: ${hasMergedDenominators(mergedWitness)}`)
for (const [frame, base] of [[24518, 12259], [24372, 12186], [23974, 11987]]) {
  if (2 * base !== frame) errors.push(`arithmetic: 2 × ${base} is not ${frame}`)
  if (!denominatorSection.includes(`${frame} = 2 × ${base}`)) errors.push(`FEATURESET.md: the ~2f scope ${frame} = 2 × ${base} is not stated`)
}
if (12259 - 12186 !== 73 || 12186 - 11987 !== 199) errors.push("arithmetic: the 73 and 199 gaps do not hold")
for (const phrase of ["withinManifestRepeatSum 73", "manifestsWithRepeats 61", "negativeDiffs 0", "199 cross-manifest"]) {
  if (!denominatorSection.includes(phrase)) errors.push(`FEATURESET.md: the 73-gap resolution is missing "${phrase}"`)
}
console.log("THREE ~2f SCOPES AND 73-GAP RESOLUTION CHECKED")
const spawnRecord = texts["FEATURESET.md"].split("\n## Spawn consolidated learning record")[1]?.split("\n## ")[0] ?? ""
const v3Rows = readFileSync(join(savi, "spawn-evidence", "data", "manifests-all-v3-results.jsonl"), "utf8").trim().split("\n").map((line) => JSON.parse(line))
const v3 = {
  rows: v3Rows.length,
  status200: v3Rows.filter((r) => r.status === 200).length,
  eof: v3Rows.filter((r) => r.eof === true).length,
  framesEqualHashes: v3Rows.filter((r) => r.framesEqualHashes === true).length,
  frames: v3Rows.reduce((a, r) => a + (r.frames || 0), 0),
  gzipFrames: v3Rows.reduce((a, r) => a + (r.gzipFrames || 0), 0),
  gzipDecodedMatch: v3Rows.reduce((a, r) => a + (r.gzipDecodedMatch || 0), 0),
  gzipFail: v3Rows.reduce((a, r) => a + (r.gzipFail || 0), 0),
}
const v3Phrase = `${v3.rows} rows, ${v3.status200} status 200, ${v3.eof} eof true, ${v3.framesEqualHashes} framesEqualHashes true, ${v3.frames} frames, ${v3.gzipFrames} gzip frame, ${v3.gzipDecodedMatch} gzip decode match, ${v3.gzipFail} gzip failures`
if (!spawnRecord.includes(v3Phrase)) errors.push(`FEATURESET.md spawn record: durable v3 figures are not stated as "${v3Phrase}"`)
counts.spawnV3 = v3
console.log(`SPAWN V3 RE-DERIVED FROM spawn-evidence/data: ${v3Phrase}`)
const nonDurableDenominators = { textVisibleKeys: 307, uniqueDecodedKeys: 11987, worldsWithCdnGlb: 399 }
const denominatorProblems = (text) => {
  const lines = text.split("\n")
  const problems = []
  for (const [name, value] of Object.entries(nonDurableDenominators)) {
    const line = lines.find((l) => denominatorPatterns[name].test(l))
    if (line === undefined) { problems.push(`${name}: no line states the denominator`); continue }
    const stated = Number(line.match(denominatorPatterns[name])[1])
    if (stated !== value) problems.push(`${name} is stated as ${stated}, expected ${value}`)
    if (!line.includes("spawn-reported")) problems.push(`${name} is not labelled spawn-reported`)
  }
  return problems
}
const denominatorLabelProblems = denominatorProblems(denominatorSection)
for (const problem of denominatorLabelProblems) errors.push(`FEATURESET.md denominators: ${problem}`)
if (denominatorProblems(denominatorSection.replace("307 text-visible keys", "11987 text-visible keys")).length === 0) errors.push("negative witness failed: substituting a different-scope number for a labelled denominator was not refused")
console.log(`DENOMINATOR LABELS (non-durable figures): ${denominatorLabelProblems.length === 0 ? "all spawn-reported" : denominatorLabelProblems.join("; ")}; substitution negative refused: true`)
const stream17 = texts["FEATURESET.md"].split("\n## Stream 17")[1]?.split("\n## ")[0] ?? ""
const stream17Cites = [...stream17.matchAll(/`((?:src|client|apps|scripts)\/[^`]+?):(\d+)` \(`([^`]+)`\)/g)]
let stream17Verified = 0
for (const [, path, lineNumber, snippet] of stream17Cites) {
  claimsChecked++
  let source = null
  try { source = execFileSync("git", ["-C", spointRoot, "show", `${spointPin}:${path}`], { encoding: "utf8" }).split("\n") } catch { source = null }
  if (source === null) { errors.push(`FEATURESET.md stream 17: ${path} is not in spoint at ${spointPin}`); continue }
  if ((source[Number(lineNumber) - 1] ?? "").includes(snippet)) stream17Verified++
  else errors.push(`FEATURESET.md stream 17: ${path}:${lineNumber} does not contain the cited text: ${snippet}`)
}
counts.stream17 = { citations: stream17Cites.length, verified: stream17Verified }
console.log(`STREAM 17 CITATIONS VERIFIED AGAINST spoint ${spointPin}: ${stream17Verified} of ${stream17Cites.length}`)
const stream18 = texts["FEATURESET.md"].split("\n## Stream 18")[1]?.split("\n## ")[0] ?? ""
const stream18Cites = [...stream18.matchAll(/`((?:src|client|apps|scripts)\/[^`]+?):(\d+)` \(`([^`]+)`\)/g)]
let stream18Verified = 0
for (const [, path, lineNumber, snippet] of stream18Cites) {
  claimsChecked++
  let source = null
  try { source = execFileSync("git", ["-C", spointRoot, "show", `d5e3860:${path}`], { encoding: "utf8" }).split("\n") } catch { source = null }
  if (source === null) { errors.push(`FEATURESET.md stream 18: ${path} is not in spoint at d5e3860`); continue }
  if ((source[Number(lineNumber) - 1] ?? "").includes(snippet)) stream18Verified++
  else errors.push(`FEATURESET.md stream 18: ${path}:${lineNumber} does not contain the cited text: ${snippet}`)
}
if (stream18Cites.length !== 25) errors.push(`FEATURESET.md stream 18: expected 25 citations, found ${stream18Cites.length}`)
const scopedNegatives = [
  ["Content-Security-Policy|Strict-Transport-Security", "", 0],
  ["Cross-Origin-Resource-Policy", "", 0],
  ["Access-Control-Allow-Origin", "", 1],
  ["rate.?limit", "src/sdk/UploadHandler.js src/sdk/StaticHandler.js src/sdk/llmJobs.js", 0],
]
const negativeCounts = scopedNegatives.map(([pattern, paths, expected]) => {
  const args = ["-C", spointRoot, "grep", "-i", "-c", "-E", pattern, "d5e3860", "--", ...(paths ? paths.split(" ") : ["src"])]
  let out = ""
  try { out = execFileSync("git", args, { encoding: "utf8" }) } catch { out = "" }
  const lines = out.split("\n").filter(Boolean).reduce((n, row) => n + Number(row.split(":").pop()), 0)
  if (lines !== expected) errors.push(`FEATURESET.md stream 18 negative ${pattern} expected ${expected}, counted ${lines}`)
  return lines
})
const callSites = execFileSync("git", ["-C", spointRoot, "grep", "-c", "timingSafeTokenEqual(", "d5e3860", "--", "src"], { encoding: "utf8" }).split("\n").filter(Boolean).map((row) => row.split(":").pop())
if (callSites.join(",") !== "3,1,1") errors.push(`FEATURESET.md stream 18: timingSafeTokenEqual call sites are ${callSites.join(",")}, expected 3,1,1`)
counts.stream18 = { citations: stream18Cites.length, verified: stream18Verified }
console.log(`STREAM 18 CITATIONS VERIFIED AGAINST spoint d5e3860: ${stream18Verified} of ${stream18Cites.length}`)
console.log(`STREAM 18 SCOPED NEGATIVES (CSP+HSTS, CORP, ACAO, rate limit): ${negativeCounts.join(", ")}`)
console.log(`STREAM 18 timingSafeTokenEqual CALL SITES (ServerAPIRoutes, ServerHandlers, authCompare): ${callSites.join(", ")}`)
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
console.log(`OPEN ROWS CITING NO EXISTING JAYZEE PATH (architectural, not a feature obligation; tracked): ${openWithoutTarget.join(", ")}`)
console.log(`OPEN ROWS CITING A JAYZEE PATH NOT CREATED (architectural, not a feature obligation; tracked): ${namedNotCreated.join(", ")}`)
for (const error of errors) console.log(`ERROR: ${error}`)
console.log(`RESULT: ${errors.length === 0 ? "PASS" : "FAIL"}`)

if (errors.length > 0) process.exitCode = 1
