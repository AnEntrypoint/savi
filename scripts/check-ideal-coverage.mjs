import { existsSync, readFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const savi = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const idealPath = resolve(savi, "..", "jayzee", "docs", "IDEAL.md")
const gapsPath = join(savi, "docs", "JAYZEE-GAPS.md")

const rowIds = readFileSync(gapsPath, "utf8")
  .split("\n")
  .map((line) => line.match(/^\| (\d+) \|/))
  .filter(Boolean)
  .map((match) => Number(match[1]))

if (!existsSync(idealPath)) {
  console.log(`IDEAL COVERAGE: ${idealPath} is missing, so none of the ${rowIds.length} gap rows can be verified`)
  console.log(`MISSING ROW IDS: ${rowIds.join(", ")}`)
  console.log("RESULT: FAIL")
  process.exit(1)
}

const ideal = readFileSync(idealPath, "utf8")
const missing = rowIds.filter((id) => !new RegExp(`\\brow ${id}\\b`, "i").test(ideal))

if (missing.length > 0) {
  console.log(`IDEAL COVERAGE: ${rowIds.length - missing.length} of ${rowIds.length} gap rows are named in ${idealPath}`)
  console.log(`MISSING ROW IDS: ${missing.join(", ")}`)
  console.log("RESULT: FAIL")
  process.exit(1)
}

console.log(`IDEAL COVERAGE: all ${rowIds.length} gap rows are named in ${idealPath}`)
console.log("RESULT: PASS")
