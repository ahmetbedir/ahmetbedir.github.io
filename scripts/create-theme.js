#!/usr/bin/env node

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get theme name from command line arguments
const themeName = process.argv[2];

if (!themeName) {
  console.error('❌ Theme name is required!');
  console.log('\nUsage: node scripts/create-theme.js <theme-name>');
  console.log('Example: node scripts/create-theme.js my-theme');
  process.exit(1);
}

// Validate theme name (should be kebab-case)
if (!/^[a-z0-9-]+$/.test(themeName)) {
  console.error('❌ Theme name must be lowercase and can only contain letters, numbers, and hyphens');
  console.log('Example: my-theme, theme-01');
  process.exit(1);
}

const themeDir = join(__dirname, '..', 'src', 'themes', themeName);
const packageName = `jsonresume-theme-${themeName}`;

// Check if theme already exists
if (fs.existsSync(themeDir)) {
  console.error(`❌ Theme "${themeName}" already exists at ${themeDir}`);
  process.exit(1);
}

// Create theme directory
await mkdir(themeDir, { recursive: true });
console.log(`✅ Created directory: ${themeDir}`);

// Create package.json
const packageJson = {
  name: packageName,
  version: "1.0.0",
  description: `Custom resume theme: ${themeName}`,
  main: "index.js",
  type: "module",
  author: "",
  license: "ISC"
};

fs.writeFileSync(
  join(themeDir, 'package.json'),
  JSON.stringify(packageJson, null, 2) + '\n'
);
console.log(`✅ Created package.json`);

// Create index.js
const indexJs = `import fs from "fs";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Handlebars from "handlebars";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function render(resume) {
	var css = fs.readFileSync(join(__dirname, "style.css"), "utf-8");
	var template = fs.readFileSync(join(__dirname, "resume.template"), "utf-8");

	// Format date helper
	Handlebars.registerHelper('formatDate', function(dateString) {
		if (!dateString) return 'Present';
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
	});

	// Format duration helper
	Handlebars.registerHelper('formatDuration', function(startDate, endDate) {
		const formatDate = (dateString) => {
			if (!dateString) return 'Present';
			const date = new Date(dateString);
			return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
		};
		const start = formatDate(startDate);
		const end = formatDate(endDate);
		return \`\${start} - \${end}\`;
	});

	// Join array helper
	Handlebars.registerHelper('join', function(array, separator) {
		if (!array || !Array.isArray(array)) return '';
		return array.join(separator || ', ');
	});

	return Handlebars.compile(template)({
		css: css,
		resume: resume
	});
}

export { render };
`;

fs.writeFileSync(join(themeDir, 'index.js'), indexJs);
console.log(`✅ Created index.js`);

// Create style.css
const styleCss = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 11pt;
  line-height: 1.6;
  color: #333;
  background: #fff;
  padding: 20px;
  max-width: 210mm;
  margin: 0 auto;
}

.header {
  border-bottom: 2px solid #2563eb;
  padding-bottom: 15px;
  margin-bottom: 20px;
}

.header h1 {
  font-size: 28pt;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 5px;
  letter-spacing: -0.5px;
}

.header .label {
  font-size: 14pt;
  color: #475569;
  font-weight: 500;
  margin-bottom: 10px;
}

.contact-info {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 9.5pt;
  color: #64748b;
  margin-top: 10px;
}

.contact-info a {
  color: #2563eb;
  text-decoration: none;
}

.contact-info a:hover {
  text-decoration: underline;
}

.section {
  margin-bottom: 20px;
  page-break-inside: avoid;
}

.section-title {
  font-size: 14pt;
  font-weight: 700;
  color: #1e293b;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 5px;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@media print {
  body {
    padding: 0;
  }
  
  .section {
    page-break-inside: avoid;
  }
}
`;

fs.writeFileSync(join(themeDir, 'style.css'), styleCss);
console.log(`✅ Created style.css`);

// Create resume.template
const resumeTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{resume.basics.name}}{{#if resume.basics.label}} - {{resume.basics.label}}{{/if}}</title>
    <style>
      {{{css}}}
    </style>
  </head>
  <body>
    <header class="header">
      <h1>{{resume.basics.name}}</h1>
      {{#if resume.basics.label}}
      <div class="label">{{resume.basics.label}}</div>
      {{/if}}
      <div class="contact-info">
        {{#if resume.basics.email}}
        <a href="mailto:{{resume.basics.email}}">{{resume.basics.email}}</a>
        {{/if}}
        {{#if resume.basics.phone}}
        <a href="tel:{{resume.basics.phone}}">{{resume.basics.phone}}</a>
        {{/if}}
        {{#if resume.basics.location}}
        <span>{{#if resume.basics.location.city}}{{resume.basics.location.city}}{{/if}}{{#if resume.basics.location.city}}{{#if resume.basics.location.countryCode}}, {{/if}}{{/if}}{{#if resume.basics.location.countryCode}}{{resume.basics.location.countryCode}}{{/if}}</span>
        {{/if}}
        {{#if resume.basics.url}}
        <a href="{{resume.basics.url}}" target="_blank">{{resume.basics.url}}</a>
        {{/if}}
        {{#if resume.basics.profiles}}
        {{#each resume.basics.profiles}}
        <a href="{{#if url}}{{url}}{{else}}#{{/if}}" target="_blank">{{network}}: {{username}}</a>
        {{/each}}
        {{/if}}
      </div>
    </header>

    {{#if resume.basics.summary}}
    <section class="section">
      <h2 class="section-title">Professional Summary</h2>
      <div class="summary">{{resume.basics.summary}}</div>
    </section>
    {{/if}}

    {{#if resume.work}}
    {{#if resume.work.length}}
    <section class="section">
      <h2 class="section-title">Professional Experience</h2>
      {{#each resume.work}}
      <div class="work-item">
        <div class="work-header">
          <div>
            <div class="work-position">{{position}}</div>
            {{#if url}}
            <div class="work-company"><a href="{{url}}" target="_blank">{{name}}</a></div>
            {{else}}
            <div class="work-company">{{name}}</div>
            {{/if}}
          </div>
          <div class="work-date">{{formatDuration startDate endDate}}</div>
        </div>
        {{#if summary}}
        <div class="work-summary">{{summary}}</div>
        {{/if}}
        {{#if highlights}}
        {{#if highlights.length}}
        <ul class="highlights">
          {{#each highlights}}
          <li>{{this}}</li>
          {{/each}}
        </ul>
        {{/if}}
        {{/if}}
      </div>
      {{/each}}
    </section>
    {{/if}}
    {{/if}}

    {{#if resume.education}}
    {{#if resume.education.length}}
    <section class="section">
      <h2 class="section-title">Education</h2>
      {{#each resume.education}}
      <div class="education-item">
        <div class="education-header">
          <div>
            <div class="education-degree">{{#if studyType}}{{studyType}}{{/if}}{{#if studyType}}{{#if area}}, {{/if}}{{/if}}{{#if area}}{{area}}{{/if}}</div>
            <div class="education-institution">{{institution}}</div>
          </div>
          {{#if startDate}}
          <div class="education-date">{{formatDuration startDate endDate}}</div>
          {{else}}
          {{#if endDate}}
          <div class="education-date">{{formatDuration startDate endDate}}</div>
          {{/if}}
          {{/if}}
        </div>
      </div>
      {{/each}}
    </section>
    {{/if}}
    {{/if}}

    {{#if resume.skills}}
    {{#if resume.skills.length}}
    <section class="section">
      <h2 class="section-title">Technical Skills</h2>
      <div class="skills-grid">
        {{#each resume.skills}}
        <div class="skill-category">
          <div class="skill-name">{{name}}{{#if level}} ({{level}}){{/if}}</div>
          {{#if keywords}}
          {{#if keywords.length}}
          <div class="skill-keywords">
            {{#each keywords}}
            <span>{{this}}</span>
            {{/each}}
          </div>
          {{/if}}
          {{/if}}
        </div>
        {{/each}}
      </div>
    </section>
    {{/if}}
    {{/if}}

    {{#if resume.languages}}
    {{#if resume.languages.length}}
    <section class="section">
      <h2 class="section-title">Languages</h2>
      {{#each resume.languages}}
      <div class="language-item">
        <span class="language-name">{{language}}</span>
        <span class="language-fluency">{{fluency}}</span>
      </div>
      {{/each}}
    </section>
    {{/if}}
    {{/if}}
  </body>
</html>
`;

fs.writeFileSync(join(themeDir, 'resume.template'), resumeTemplate);
console.log(`✅ Created resume.template`);

// Update package.json to add new theme
const rootPackageJsonPath = join(__dirname, '..', 'package.json');
const rootPackageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf-8'));

if (!rootPackageJson.dependencies) {
  rootPackageJson.dependencies = {};
}

rootPackageJson.dependencies[packageName] = `file:./src/themes/${themeName}`;

fs.writeFileSync(
  rootPackageJsonPath,
  JSON.stringify(rootPackageJson, null, 2) + '\n'
);
console.log(`✅ Added ${packageName} to package.json dependencies`);

console.log('\n🎉 Theme boilerplate created successfully!');
console.log(`\nNext steps:`);
console.log(`1. Run: yarn install`);
console.log(`2. Add script to package.json: "theme-${themeName}": "resumed config/resume.json --theme ${packageName} --output dist/resume-${themeName}.html"`);
console.log(`3. Customize style.css and resume.template`);
console.log(`4. Test: yarn theme-${themeName}`);

