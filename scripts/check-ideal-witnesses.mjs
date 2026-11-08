import { existsSync, readFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const savi = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const jayzee = resolve(savi, "..", "jayzee")
const idealPath = join(jayzee, "docs", "IDEAL.md")

if (!existsSync(idealPath)) {
  console.log(`IDEAL WITNESSES: ${idealPath} is missing, so no partial row can be checked`)
  console.log("RESULT: FAIL")
  process.exit(1)
}

const witnessPattern = /scripts\/[A-Za-z0-9._\/-]+\.mjs/g
const rowsBeforeTotals = readFileSync(idealPath, "utf8").split(/^## 5\. /m)[0]
const partialRows = rowsBeforeTotals
  .split("\n")
  .filter((line) => line.startsWith("|"))
  .map((line) => ({ line, cells: line.split("|").slice(1, -1).map((cell) => cell.trim()) }))
  .filter(({ cells }) => cells.includes("partial"))
  .map(({ cells }) => ({ label: cells[0], proof: cells[cells.indexOf("partial") + 1] || "" }))

const errors = []
let named = 0

for (const { label, proof } of partialRows) {
  const witnesses = [...new Set(proof.match(witnessPattern) || [])]
  if (witnesses.length === 0) {
    errors.push(`${label} is partial but names no scripts/*.mjs witness`)
    continue
  }
  const missing = witnesses.filter((path) => !existsSync(join(jayzee, path)))
  for (const path of missing) errors.push(`${label} names a witness that does not exist: ${path}`)
  if (missing.length === 0) named += 1
}

console.log(`IDEAL WITNESSES: ${named} of ${partialRows.length} partial rows name only witnesses that exist in ${idealPath}`)
for (const error of errors) console.log(`ERROR: ${error}`)
console.log(`RESULT: ${errors.length === 0 ? "PASS" : "FAIL"}`)
if (errors.length > 0) process.exitCode = 1
