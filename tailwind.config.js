/** @type {import('tailwindcss').Config} */
import { fullwindcss } from "fullwindcss";
module.exports = {
	content: [
		"./**/*.{html,njk}"
	],
	plugins: [
		fullwindcss,
	],
}
