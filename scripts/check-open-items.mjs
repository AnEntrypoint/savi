import { execFileSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const docPath = resolve(dirname(fileURLToPath(import.meta.url)), "..", "docs", "OPEN-ITEMS.md")
const allowedStatuses = new Set(["OPEN", "RESOLVED", "INFERRED", "UNVERIFIED", "BEHAVIOUR", "DIFFERENT-DATASET", "HELD-OWNER"])
const errors = []
let text = ""

try {
  text = readFileSync(docPath, "utf8")
} catch {
  errors.push(`missing register: ${docPath}`)
}

const items = []
let current = null

for (const line of text.split(/\r?\n/)) {
  const heading = line.match(/^### (OPEN-\d{3})$/)
  if (heading) {
    if (current) items.push(current)
    current = { id: heading[1], body: [] }
    continue
  }
  if (/^## /.test(line) && current) {
    items.push(current)
    current = null
    continue
  }
  if (current) current.body.push(line)
}

if (current) items.push(current)

const ids = items.map((item) => item.id)
if (new Set(ids).size !== ids.length) errors.push("IDs are not unique")

ids.forEach((id, index) => {
  const expected = `OPEN-${String(index + 1).padStart(3, "0")}`
  if (id !== expected) errors.push(`ID ${id} is not sequential at position ${index + 1}; expected ${expected}`)
})

for (const item of items) {
  const statusLine = item.body.find((line) => line.startsWith("Status: "))
  const witnessLine = item.body.find((line) => line.startsWith("Witness: "))
  const sourceLine = item.body.find((line) => line.startsWith("Source paths: "))
  const status = statusLine ? statusLine.slice("Status: ".length) : ""
  if (!allowedStatuses.has(status)) errors.push(`${item.id} has invalid or missing status`)
  if (!witnessLine || witnessLine.slice("Witness: ".length).trim() === "") errors.push(`${item.id} has no witness`)
  if (!sourceLine || sourceLine.slice("Source paths: ".length).trim() === "") errors.push(`${item.id} has no source paths`)
}

const workspacePaths = [...new Set((text.match(/\/workspace\/[A-Za-z0-9_.\/-]+/g) || [])
  .map((path) => path.replace(/[.,;:)\]]+$/, "")))]

for (const path of workspacePaths) {
  if (!existsSync(path)) errors.push(`missing cited path: ${path}`)
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const commitExists = (id) => {
  try {
    execFileSync("git", ["-C", repoRoot, "cat-file", "-e", `${id}^{commit}`], { stdio: "ignore" })
    return true
  } catch {
    return false
  }
}
const resolutionCommitErrors = (body) => body
  .split("\n")
  .filter((line) => line.startsWith("Resolution: "))
  .flatMap((line) => [...line.matchAll(/`([0-9a-f]{7,40})`/g)].map((m) => m[1]))
  .filter((id) => !commitExists(id))
  .map((id) => `resolution cites a commit that does not exist: ${id}`)
for (const item of items) errors.push(...resolutionCommitErrors(item.body.join("\n")))
const resolutionNegative = resolutionCommitErrors("Resolution: `0000000000`")
if (resolutionNegative.length !== 1) errors.push("negative witness failed: a resolution citing a nonexistent commit was not refused")
const resolutionCount = items.filter((item) => item.body.some((line) => line.startsWith("Resolution: "))).length
console.log(`RESOLUTION LINES: ${resolutionCount} items resolved with cited commits present; nonexistent commit refused: ${resolutionNegative.length === 1}`)

const closedPointers = (body) => (body.match(/\/workspace\/gm\/closes\/[A-Za-z0-9_.\/-]+/g) || []).map((path) => path.replace(/[.,;:)\]]+$/, ""))
const closedPointerErrors = (body) => closedPointers(body).filter((path) => !existsSync(path)).map((path) => `closed-row pointer does not resolve: ${path}`)
for (const item of items) errors.push(...closedPointerErrors(item.body.join("\n")))
const negativeWitness = closedPointerErrors("Source paths: `/workspace/gm/closes/no-such-closure-for-negative-witness.txt`")
if (negativeWitness.length !== 1) errors.push("negative witness failed: a nonexistent closes pointer was not refused")
console.log(`CLOSED-ROW POINTERS: ${items.reduce((n, item) => n + closedPointers(item.body.join("\n")).length, 0)} cited, negative witness refused ${negativeWitness.length}`)

console.log(`OPEN-ITEMS COUNT: ${items.length}`)
console.log(`CITED WORKSPACE PATHS: ${workspacePaths.length}`)
for (const error of errors) console.log(`ERROR: ${error}`)
console.log(`RESULT: ${errors.length === 0 ? "PASS" : "FAIL"}`)

if (errors.length > 0) process.exitCode = 1
