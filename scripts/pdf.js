import { promises as fs } from "fs";
import * as theme from "jsonresume-theme-even";
import puppeteer from "puppeteer";
import { render } from "resumed";

const resume = JSON.parse(await fs.readFile("config/resume.json", "utf-8"));
const html = await render(resume, theme);

const browser = await puppeteer.launch();
const page = await browser.newPage();

await page.setContent(html, { waitUntil: "networkidle0" });
await page.pdf({
  path: "resume/ahmetbedir.pdf",
  //format: "a1",
  printBackground: true,
  height: "2550px",
  width: "800px",
});
await browser.close();
