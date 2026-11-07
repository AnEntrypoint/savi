import { existsSync, readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const docPath = resolve(dirname(fileURLToPath(import.meta.url)), "..", "docs", "OPEN-ITEMS.md")
const allowedStatuses = new Set(["OPEN", "INFERRED", "UNVERIFIED", "BEHAVIOUR", "DIFFERENT-DATASET", "HELD-OWNER"])
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

console.log(`OPEN-ITEMS COUNT: ${items.length}`)
console.log(`CITED WORKSPACE PATHS: ${workspacePaths.length}`)
for (const error of errors) console.log(`ERROR: ${error}`)
console.log(`RESULT: ${errors.length === 0 ? "PASS" : "FAIL"}`)

if (errors.length > 0) process.exitCode = 1
