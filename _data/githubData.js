import Fetch from "@11ty/eleventy-fetch";
import '@dotenvx/dotenvx/config';

// Send the token: anonymous requests get 60/hour per IP, and Cloudflare's shared
// build IPs often have used them up already ("403: rate limit exceeded").
const fetchOptions = process.env.GITHUB_TOKEN
	? { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } }
	: {};

async function allRepos() {
	let url = "https://api.github.com/orgs/deepnest-next/repos"; //https://api.github.com/repos/deepnest-next/deepnest/releases

	let json = await Fetch(url, {
		duration: "1h", // save for 1 day
		type: "json", // we’ll parse JSON for you
		verbose: true,
		fetchOptions
	});

	return json;
};

async function mainRepo() {
	let url = "https://api.github.com/repos/deepnest-next/deepnest"; //https://api.github.com/repos/deepnest-next/deepnest/releases

	let json = await Fetch(url, {
		duration: "1h", // save for 1 day
		type: "json", // we’ll parse JSON for you
		verbose: true,
		fetchOptions
	});

	return json;
};

async function releases() {
	let url = "https://api.github.com/repos/deepnest-next/deepnest/releases";

	let json = await Fetch(url, {
		duration: "1h", // save for 1 day
		type: "json", // we’ll parse JSON for you
		verbose: true,
		fetchOptions
	});

	// pre-releases (betas) stay off the website and the in-app notification feed; see deepnest/RELEASE.md
	return Array.isArray(json) ? json.filter((release) => !release.prerelease && !release.draft) : json;
};
export default {
	allRepos: await allRepos(),
	mainRepo: await mainRepo(),
	releases: await releases(),
};
