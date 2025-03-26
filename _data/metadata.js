import defaultSettings from "../config.page.json" with { type: "json" };

const URLS = {
	production: "https://www.deepnest.net/",
	devel_cf: "https://devel.deepnest-net.pages.dev/",
	development: "http://localhost:8080/",
	// Add other environments as needed
};

export default {
	debug: false,
	title: "deepnest-next",
	url: URLS[process.env.BUILD_MODE] || URLS.development,
	language: defaultSettings.defaultLanguage,
  supportedLanguages: defaultSettings.languages,
	description: "I am writing about my experiences as a naval navel-gazer.",
	author: {
		name: "Josef Fröhle",
		email: "dexus@deepnest.net",
		url: "https://www.josef-froehle.de/"
	},
	enableLogin: false,
}
