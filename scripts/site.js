import { promises as fs } from "fs";
import * as theme from "jsonresume-theme-even";
import { render } from "resumed";

const escapeAttr = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const resume = JSON.parse(await fs.readFile("config/resume.json", "utf-8"));
let html = await render(resume, theme);

const { name = "", label = "", summary = "", url = "", image = "" } = resume.basics || {};
const pageTitle = label ? `${name} — ${label}` : name;

const headInject = `
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23191e23'/%3E%3Ctext x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' fill='%23fbfbfc' font-family='sans-serif' font-size='28' font-weight='700'%3EAB%3C/text%3E%3C/svg%3E" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeAttr(pageTitle)}" />
    <meta property="og:description" content="${escapeAttr(summary)}" />
    ${url ? `<meta property="og:url" content="${escapeAttr(url)}" />` : ""}
    ${image ? `<meta property="og:image" content="${escapeAttr(image)}" />` : ""}
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${escapeAttr(pageTitle)}" />
    <meta name="twitter:description" content="${escapeAttr(summary)}" />
    <style>
      .pdf-download-btn {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 100;
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.5rem 0.9rem;
        border-radius: 999px;
        background: var(--color-accent);
        color: #ffffff;
        font-size: 0.9rem;
        font-weight: 700;
        text-decoration: none;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.16);
        transition: opacity 0.15s ease, transform 0.15s ease;
      }
      .pdf-download-btn:hover,
      .pdf-download-btn:focus {
        opacity: 0.9;
        transform: translateY(-1px);
        text-decoration: none;
      }
      .pdf-download-btn svg {
        margin-right: 0;
        vertical-align: middle;
      }
      @media print {
        .pdf-download-btn {
          display: none !important;
        }
      }
    </style>
  </head>`;

const downloadButton = `<body>
    <a class="pdf-download-btn" href="resume/ahmetbedir.pdf" download="Ahmet-Bedir-Resume.pdf" aria-label="Download PDF Resume">
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      Download PDF
    </a>`;

html = html
  .replace(/<title>.*?<\/title>/, `<title>${escapeAttr(pageTitle)}</title>`)
  .replace("</head>", headInject)
  .replace("<body>", downloadButton);

await fs.writeFile("index.html", html, "utf-8");
console.log("Generated index.html");
