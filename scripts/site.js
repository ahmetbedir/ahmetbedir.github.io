import { promises as fs } from "fs";
import { render } from "resumed";
import * as theme from "../themes/portfolio/index.js";

const resume = JSON.parse(await fs.readFile("config/resume.json", "utf-8"));
const html = await render(resume, theme);

await fs.writeFile("index.html", html, "utf-8");
console.log("Generated index.html (portfolio theme)");
