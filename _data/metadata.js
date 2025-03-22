import defaultSettings from "../config.page.json" with { type: "json" };
export default {
	debug: false,
	title: "deepnest-next",
	url: process.env.BUILD_MODE !== "production" ? "http://localhost:8080/" : "https://www.deepnest.net/",
	language: defaultSettings.defaultLanguage,
	description: "I am writing about my experiences as a naval navel-gazer.",
	author: {
		name: "Josef Fröhle",
		email: "dexus@deepnest.net",
		url: "https://www.josef-froehle.de/"
	},
	enableLogin: false,
}
