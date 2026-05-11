import { chromium } from "playwright";

const BASE = "http://host.docker.internal:4005";
const TEST_TEXT = "hello from the automated test — " + Date.now();

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage();

// Capture console errors
page.on("console", msg => {
  if (msg.type() === "error") console.error("BROWSER ERROR:", msg.text());
});

console.log("1. Loading submit page...");
await page.goto(BASE);
await page.waitForSelector("#text-input");
console.log("   OK — page loaded");

console.log("2. Typing text and submitting...");
await page.fill("#text-input", TEST_TEXT);
await page.click("#submit-btn");

console.log("3. Waiting for permalink to appear...");
await page.waitForSelector("#success-box.visible", { timeout: 5000 });
const permalink = await page.inputValue("#permalink");
const hash = await page.textContent("#hash-display");
console.log("   Permalink:", permalink);
console.log("   Hash:     ", hash);

if (!permalink.includes("#") || hash.length !== 64) {
  console.error("FAIL: permalink or hash looks wrong");
  process.exit(1);
}

console.log("4. Navigating to the permalink...");
await page.goto(permalink);
await page.waitForSelector("#view-mode.visible", { timeout: 5000 });

console.log("5. Checking retrieved content...");
const displayed = await page.textContent("#content-display");
console.log("   Displayed text:", JSON.stringify(displayed));

if (displayed.trim() === TEST_TEXT) {
  console.log("\nPASS: submitted text matches retrieved text");
} else {
  console.error("\nFAIL: mismatch");
  console.error("  expected:", JSON.stringify(TEST_TEXT));
  console.error("  got:     ", JSON.stringify(displayed.trim()));
  process.exit(1);
}

await browser.close();
