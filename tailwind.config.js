/** @type {import('tailwindcss').Config} */
import { fullwindcss } from "fullwindcss";
module.exports = {
	darkMode: "class",
	content: [
		"./includes/*.{html,njk}",
		"./content/*.{html,md,liquid,njk}"
	],
	plugins: [
		fullwindcss,
	],
}
