#!/usr/bin/env tsx
import { execFileSync } from "node:child_process"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { createInterface } from "node:readline/promises"

/**
 * Cuts a release.
 *
 * `.env` is the single source of truth for the version (AGENTS.md §5), so this
 * script is the only thing permitted to change `APP_VERSION`. It derives the
 * bump from Conventional Commits, then drives `package.json`, both changelogs,
 * the commit, the tag and the image tag from that one value — which is the whole
 * point: they cannot drift if they are all written in the same pass.
 *
 *   npm run release                          bump derived from commits
 *   npm run release -- --minor               force a level
 *   npm run release -- --dry-run             print the plan, touch nothing
 *   npm run release -- --user-notes <file>   supply the Persian notes non-interactively
 *   npm run release -- --no-docker           skip the image build
 */

type Level = "major" | "minor" | "patch"

interface Commit {
  hash: string
  type: string
  scope: string
  subject: string
  breaking: boolean
}

const ENV_FILE = ".env"
const TECHNICAL_CHANGELOG = "CHANGELOG.md"
const USER_CHANGELOG = "CHANGELOG-USER.md"

/** Field and record separators, so a commit body containing newlines still parses. */
const FIELD = ""
const RECORD = ""

/**
 * `docs`, `chore`, `style` and `test` are deliberately absent: they are in git
 * history, and a changelog that lists everything is a changelog nobody reads.
 */
const SECTIONS: Record<string, string> = {
  feat: "Added",
  fix: "Fixed",
  perf: "Performance",
  refactor: "Changed",
}

const args = process.argv.slice(2)
const has = (flag: string) => args.includes(flag)
const valueOf = (flag: string) => {
  const index = args.indexOf(flag)
  return index === -1 ? undefined : args[index + 1]
}

const git = (...command: string[]) => execFileSync("git", command, { encoding: "utf8" }).trim()

function fail(message: string): never {
  console.error(`release: ${message}`)
  process.exit(1)
}

function readEnvValue(source: string, key: string): string {
  const match = new RegExp(`^${key}=(.*)$`, "m").exec(source)
  if (!match) fail(`${ENV_FILE} has no ${key}`)
  return match[1]!.trim()
}

function parseCommits(range: string): Commit[] {
  const log = git("log", "--no-merges", `--format=%h${FIELD}%s${FIELD}%b${RECORD}`, range)
  if (!log) return []

  return log
    .split(RECORD)
    .map((record) => record.trim())
    .filter(Boolean)
    .map((record) => {
      const [hash = "", subject = "", body = ""] = record.split(FIELD)
      const match = /^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)$/.exec(subject.trim())
      if (!match) return null
      return {
        hash: hash.trim(),
        type: match[1]!,
        scope: match[2] ?? "",
        subject: match[4]!,
        breaking: match[3] === "!" || /^BREAKING CHANGE:/m.test(body),
      }
    })
    .filter((commit): commit is Commit => commit !== null)
}

function deriveLevel(commits: Commit[]): Level | null {
  if (commits.some((commit) => commit.breaking)) return "major"
  if (commits.some((commit) => commit.type === "feat")) return "minor"
  if (commits.some((commit) => commit.type === "fix" || commit.type === "perf")) return "patch"
  return null
}

function bump(version: string, level: Level): string {
  const [major = 0, minor = 0, patch = 0] = version.split(".").map(Number)
  if (level === "major") return `${major + 1}.0.0`
  if (level === "minor") return `${major}.${minor + 1}.0`
  return `${major}.${minor}.${patch + 1}`
}

/** Jalali, to match every other date the team reads. */
function jalaliToday(): string {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Tehran",
  }).format(new Date())
}

const entry = (commit: Commit) =>
  `- ${commit.scope ? `**${commit.scope}:** ` : ""}${commit.subject} (${commit.hash})`

function technicalSection(version: string, commits: Commit[]): string {
  const lines = [`## [${version}] — ${new Date().toISOString().slice(0, 10)}`, ""]

  const breaking = commits.filter((commit) => commit.breaking)
  if (breaking.length > 0) {
    lines.push("### Breaking")
    for (const commit of breaking) lines.push(entry(commit))
    lines.push("")
  }

  for (const [type, heading] of Object.entries(SECTIONS)) {
    const matching = commits.filter((commit) => commit.type === type && !commit.breaking)
    if (matching.length === 0) continue
    lines.push(`### ${heading}`)
    for (const commit of matching) lines.push(entry(commit))
    lines.push("")
  }

  return lines.join("\n")
}

async function readUserNotes(version: string): Promise<string> {
  const file = valueOf("--user-notes")
  if (file) {
    if (!existsSync(file)) fail(`--user-notes file not found: ${file}`)
    const text = readFileSync(file, "utf8").trim()
    if (!text) fail("--user-notes file is empty")
    return text
  }

  if (!process.stdin.isTTY) {
    fail(
      "the Persian user changelog cannot be generated from commit messages.\n" +
        "  Write it to a file and pass --user-notes <file>, or run this in a terminal.",
    )
  }

  console.log(
    `\nWrite the Persian notes for v${version} — what a booth operator would notice.\n` +
      "Sections: جدید / بهبود / رفع اشکال. End with a blank line.\n",
  )
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const lines: string[] = []
  for (;;) {
    const line = await rl.question("")
    if (line === "" && lines.length > 0) break
    lines.push(line)
  }
  rl.close()

  const text = lines.join("\n").trim()
  // Deliberate friction: an auto-generated user changelog is the technical one
  // with the prefixes stripped, which is worse than none. See docs/operations/04.
  if (!text) fail("the user changelog entry cannot be empty")
  return text
}

/** Inserts a released section directly under the file's "unreleased" heading. */
function insertRelease(file: string, unreleased: string, section: string): void {
  const source = readFileSync(file, "utf8")
  if (!source.includes(unreleased)) fail(`${file} has no "${unreleased}" heading`)
  writeFileSync(file, source.replace(unreleased, `${unreleased}\n\n${section.trim()}`))
}

async function main(): Promise<void> {
  const dryRun = has("--dry-run")

  if (!dryRun) {
    if (git("status", "--porcelain")) fail("the working tree is dirty — commit or stash first")
    const branch = git("rev-parse", "--abbrev-ref", "HEAD")
    if (branch !== "main") fail(`releases are cut from main, not ${branch}`)
  }

  const lastTag = (() => {
    try {
      return git("describe", "--tags", "--abbrev=0", "--match", "v*")
    } catch {
      return ""
    }
  })()

  const commits = parseCommits(lastTag ? `${lastTag}..HEAD` : "HEAD")
  const forced = (["major", "minor", "patch"] as const).find((level) => has(`--${level}`))
  const level = forced ?? deriveLevel(commits)
  if (!level) fail("no feat, fix, perf or breaking commits since the last tag — nothing to release")

  const envSource = readFileSync(ENV_FILE, "utf8")
  const current = readEnvValue(envSource, "APP_VERSION")
  const next = bump(current, level)

  console.log(
    `release: ${current} -> ${next} (${level}), ` +
      `${commits.length} commits since ${lastTag || "the beginning"}`,
  )
  if (dryRun) {
    console.log("\n" + technicalSection(next, commits))
    return
  }

  const userNotes = await readUserNotes(next)

  writeFileSync(
    ENV_FILE,
    envSource
      .replace(/^APP_VERSION=.*$/m, `APP_VERSION=${next}`)
      .replace(/^APP_BUILD_DATE=.*$/m, `APP_BUILD_DATE=${new Date().toISOString().slice(0, 10)}`),
  )

  // One direction only: `.env` is authoritative, package.json follows.
  const pkg = JSON.parse(readFileSync("package.json", "utf8")) as { version: string }
  pkg.version = next
  writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n")

  insertRelease(TECHNICAL_CHANGELOG, "## [Unreleased]", technicalSection(next, commits))
  insertRelease(USER_CHANGELOG, "## منتشرنشده", `## نسخه ${next} — ${jalaliToday()}\n\n${userNotes}`)

  git("add", ENV_FILE, "package.json", TECHNICAL_CHANGELOG, USER_CHANGELOG)
  git("commit", "-m", `chore(release): v${next}`)
  git("tag", "-a", `v${next}`, "-m", technicalSection(next, commits))
  console.log(`release: committed and tagged v${next}`)

  if (has("--no-docker")) return
  const image = readEnvValue(readFileSync(ENV_FILE, "utf8"), "DOCKER_IMAGE")
  try {
    execFileSync(
      "docker",
      [
        "build",
        "--target",
        "runner",
        "--build-arg",
        `APP_VERSION=${next}`,
        "-t",
        `${image}:${next}`,
        "-t",
        `${image}:latest`,
        ".",
      ],
      { stdio: "inherit" },
    )
    console.log(`release: built ${image}:${next}`)
  } catch {
    // A tagged commit with no image is recoverable; a half-released version is
    // not. Say what is missing and leave the tag standing.
    console.error(
      `release: v${next} is committed and tagged, but the image build failed.\n` +
        `  Build it when Docker is available:  docker build --target runner ` +
        `--build-arg APP_VERSION=${next} -t ${image}:${next} .`,
    )
  }
}

await main()
