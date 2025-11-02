import fs from "fs";
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
		return `${start} - ${end}`;
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
