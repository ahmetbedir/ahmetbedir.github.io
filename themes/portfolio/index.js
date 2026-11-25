import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Handlebars from "handlebars";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function render(resume) {
  const css = fs.readFileSync(join(__dirname, "style.css"), "utf-8");
  const template = fs.readFileSync(join(__dirname, "resume.template"), "utf-8");

  const hb = Handlebars.create();

  hb.registerHelper("formatDate", function (dateString) {
    if (!dateString) return "Present";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
  });

  hb.registerHelper("formatDuration", function (startDate, endDate) {
    if (!startDate) return "";
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    let totalMonths =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    if (totalMonths < 1) totalMonths = 1;
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    const parts = [];
    if (years > 0) parts.push(`${years} ${years === 1 ? "yr" : "yrs"}`);
    if (months > 0) parts.push(`${months} ${months === 1 ? "mo" : "mos"}`);
    return parts.join(" ");
  });

  hb.registerHelper("eq", function (a, b) {
    return a === b;
  });

  hb.registerHelper("currentYear", function () {
    return new Date().getFullYear();
  });

  hb.registerHelper("initials", function (name) {
    if (!name) return "AB";
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  });

  hb.registerHelper("stripProtocol", function (url) {
    if (!url) return "";
    return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  });

  const currentJob = resume.work && resume.work.length ? resume.work[0] : null;
  const b = resume.basics || {};

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    name: b.name,
    jobTitle: b.label,
    url: b.url,
    image: b.image,
    email: b.email ? `mailto:${b.email}` : undefined,
    address: b.location && {
      "@type": "PostalAddress",
      addressLocality: b.location.city,
      addressCountry: b.location.countryCode,
    },
    sameAs: (b.profiles || []).map((p) => p.url),
    worksFor: currentJob && { "@type": "Organization", name: currentJob.name, url: currentJob.url },
    alumniOf: (resume.education || []).map((e) => ({ "@type": "CollegeOrUniversity", name: e.institution })),
    knowsAbout: (resume.skills || []).flatMap((s) => s.keywords || []),
  }).replace(/</g, "\\u003c"); // keep "</script>" in data from closing the tag

  return hb.compile(template)({
    css,
    resume,
    currentJob,
    jsonLd,
  });
}

export { render };
