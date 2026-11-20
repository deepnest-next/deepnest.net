import Fetch from "@11ty/eleventy-fetch";

async function allRepos() {
	let url = "https://api.github.com/orgs/deepnest-next/repos"; //https://api.github.com/repos/deepnest-next/deepnest/releases

	let json = await Fetch(url, {
		duration: "1h", // save for 1 day
		type: "json", // we’ll parse JSON for you
		verbose: true
	});

	return json;
};

async function mainRepo() {
	let url = "https://api.github.com/repos/deepnest-next/deepnest"; //https://api.github.com/repos/deepnest-next/deepnest/releases

	let json = await Fetch(url, {
		duration: "1h", // save for 1 day
		type: "json", // we’ll parse JSON for you
		verbose: true
	});

	return json;
};

async function releases() {
	let url = "https://api.github.com/repos/deepnest-next/deepnest/releases";

	let json = await Fetch(url, {
		duration: "1h", // save for 1 day
		type: "json", // we’ll parse JSON for you
		verbose: true
	});

	// pre-releases (betas) stay off the website and the in-app notification feed; see deepnest/RELEASE.md
	return Array.isArray(json) ? json.filter((release) => !release.prerelease && !release.draft) : json;
};
export default {
	allRepos: await allRepos(),
	mainRepo: await mainRepo(),
	releases: await releases(),
};
