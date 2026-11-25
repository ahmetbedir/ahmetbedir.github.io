import { existsSync, promises as fs } from "fs";
import puppeteer from "puppeteer";
import { render } from "resumed";
import * as theme from "../themes/professional/index.js";

const CHROME_CANDIDATES = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
].filter(Boolean);

async function launchBrowser() {
  try {
    return await puppeteer.launch();
  } catch (err) {
    const fallback = CHROME_CANDIDATES.find((p) => existsSync(p));
    if (!fallback) throw err;
    return await puppeteer.launch({ executablePath: fallback });
  }
}

const resume = JSON.parse(await fs.readFile("config/resume.json", "utf-8"));
const html = await render(resume, theme);

await fs.mkdir("resume", { recursive: true });
await fs.writeFile("resume/ahmetbedir.html", html, "utf-8");

const browser = await launchBrowser();
try {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.pdf({
    path: "resume/ahmetbedir.pdf",
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
  });
} finally {
  await browser.close();
}

console.log("Generated resume/ahmetbedir.html and resume/ahmetbedir.pdf (A4)");
