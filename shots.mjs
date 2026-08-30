import { chromium } from "playwright"
const OUT = "/tmp/claude-501/shots"
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
const errs = []
p.on("pageerror", (e) => errs.push(String(e)))
await p.goto("http://localhost:3000/", { waitUntil: "networkidle" })
await p.waitForTimeout(2400)
await p.screenshot({ path: `${OUT}/L-attract.png` })

const hop = async (name, fn) => {
  await fn(); await p.waitForTimeout(1900)
  await p.screenshot({ path: `${OUT}/L-${name}.png` })
}
await hop("home", () => p.locator("#scene-attract button").first().click())
await hop("courses", () => p.locator("#scene-home").getByText("دوره‌ها").click())
await hop("detail", () => p.locator("#scene-courses").getByText("جزئیات ←").first().click())
await hop("offer", () => p.getByText("خانه").first().click().then(async () => {
  await p.waitForTimeout(1800)
  await p.locator("#scene-home").getByText("پیشنهاد ویژه جشنواره").click()
}))
await hop("map", () => p.getByText("نقشه کامل").click())
console.log("errors:", errs.length ? errs.slice(0,3) : "none")
await b.close()
