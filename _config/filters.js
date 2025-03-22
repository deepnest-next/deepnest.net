import { DateTime } from "luxon";
import { marked } from 'marked';
import markedBidi from "marked-bidi";
import markedAlert from 'marked-alert';
import markedLinkifyIt from "marked-linkify-it";
marked.use(markedBidi());
marked.use(markedAlert());

var debug = true;

const schemas = {
	'@': {
		validate: function (text, pos, self) {
			const tail = text.slice(pos);

			if (!self.re.githubuser) {
				self.re.githubuser = new RegExp(
					'^([a-zA-Z0-9_-]){1,24}(?!_)(?=$|' + self.re.src_ZPCc + ')'
				);
			}
			if (self.re.githubuser.test(tail)) {
				// Linkifier allows punctuation chars before prefix,
				// but we additionally disable `@` ("@@mention" is invalid)
				if (pos >= 2 && tail[pos - 2] === '@') {
					return false;
				}
				return tail.match(self.re.githubuser)[0].length;
			}
			return 0;
		},
		normalize: function (match) {
			match.url = 'https://github.com/' + match.url.replace(/^@/, '');
		}
	},
};
const options = {};

marked.use(markedLinkifyIt(schemas, options));


function gfmLinks(text, context) {/*
* Adapted from Github's port of showdown.js -- A javascript port of Markdown.
*
* GitHub Flavored Markdown modifications by Tekkub
* @see https://github.com/isaacs/github-flavored-markdown/blob/master/scripts/showdown.js
* Fixes for "&#39;" issue misrecognition by C. W. Johannsen.
*/


	var username, repo;
	if (debug) console.log('>>>context="' + context + "'");
	if (context) {
		var parts = context.split('/');
		username = parts[0];
		repo = parts[1];
		if (!repo) context = null;
	}

	// Auto-link user/repo@sha1
	text = text.replace(/([a-z0-9_\-+=.]+\/[a-z0-9_\-+=.]+)@([a-f0-9]{40})/ig, function (wholeMatch, context, sha) {
		if (debug) console.log('wholeMatch 1="' + wholeMatch + '"');
		return '<a href="https://github.com/' + context + '/commit/' + sha + '">' + context + '@' + sha.substring(0, 7) + '</a>';
	});

	// Auto-link user@sha1 and user#issue if repo is defined
	if (repo) {
		text = text.replace(/([a-z0-9_\-+=.]+)@([a-f0-9]{40})/ig, function (wholeMatch, username, sha, matchIndex) {
			if (debug) console.log('wholeMatch 2="' + wholeMatch + '"');
			var left = text.slice(0, matchIndex), right = text.slice(matchIndex);
			if (left.match(/\/$/) || (left.match(/<[^>]+$/) && right.match(/^[^>]*>/))) return wholeMatch;
			return '<a href="https://github.com/' + username + '/' + repo + '/commit/' + sha + '">' + username + '@' + sha.substring(0, 7) + '</a>';
		});
		text = text.replace(/([a-z0-9_\-+=.]+)#([0-9]+)/ig, function (wholeMatch, username, issue, matchIndex) {
			if (debug) console.log('wholeMatch 3="' + wholeMatch + '", username="' + username + '", issue="' + issue + '"');
			var left = text.slice(0, matchIndex), right = text.slice(matchIndex);
			if (left.match(/\/$/) || (left.match(/<[^>]+$/) && right.match(/^[^>]*>/))) return wholeMatch;
			return '<a href="https://github.com/' + username + '/' + repo + '/issues/' + issue + '">' + wholeMatch + '</a>';
		});
	}

	// Auto-link sha1 and #issue if context is defined
	if (context) {
		text = text.replace(/[a-f0-9]{40}/ig, function (wholeMatch, matchIndex) {
			if (debug) console.log('wholeMatch 4="' + wholeMatch + '"');
			var left = text.slice(0, matchIndex), right = text.slice(matchIndex);
			if (left.match(/@$/) || (left.match(/<[^>]+$/) && right.match(/^[^>]*>/))) return wholeMatch;
			return '<a href="https://github.com/' + context + '/commit/' + wholeMatch + '">' + wholeMatch.substring(0, 7) + '</a>';
		});
		text = text.replace(/[^\&]#([0-9]+)/ig, function (wholeMatch, issue, matchIndex) {
			if (debug) console.log('wholeMatch 5="' + wholeMatch + '", issue="' + issue + '"');
			var left = text.slice(0, matchIndex + 1), right = text.slice(matchIndex);
			if (debug) console.log('left="' + left + '", right="' + right + '"');
			if (left.match(/[a-z0-9_\-+=.]$/) || (left.match(/<[^>]+$/) && right.match(/^[^>]*>/))) return wholeMatch;
			return wholeMatch.slice(0, 1) + '<a href="https://github.com/' + context + '/issues/' + issue + '">' + wholeMatch.slice(1) + '</a>';
		});
	}

	// Auto-link user/repo#issue
	text = text.replace(/([a-z0-9_\-+=.]+\/[a-z0-9_\-+=.]+[^&]?)#([0-9]+)/ig, function (wholeMatch, context, issue) {
		if (debug) console.log('wholeMatch 6="' + wholeMatch + '", context="' + context + '", issue=' + issue);
		return '<a href="https://github.com/' + context + '/issues/' + issue + '">' + wholeMatch + '</a>';
	});


	// Auto-link user/repo/pull/pr
	text = text.replace(/https:\/\/github.com\/([a-z0-9_\-+=.]+\/[a-z0-9_\-+=.]+)\/pull\/([0-9]{1,6})/ig, function (wholeMatch, context, pr) {
		if (debug) console.log('wholeMatch 7="' + wholeMatch + '"');
		return '<a href="https://github.com/' + context + '/pull/' + pr + '">#' + pr.substring(0, 7) + '</a>';
	});

	text = text.replace(/https:\/\/github.com\/([a-z0-9_\-+=.]+\/[a-z0-9_\-+=.]+)\/compare\/([a-zA-Z0-9.\-]{1,20})/ig, function (wholeMatch, context, compare) {
		if (debug) console.log('wholeMatch 8="' + wholeMatch + '"');
		return '<a href="https://github.com/' + context + '/compare/' + compare + '">' + compare + '</a>';
	});


	return text;
};

export default function (eleventyConfig) {

	eleventyConfig.addNunjucksGlobal("unixtime", function () {
		return new Date().getTime()
	});

	eleventyConfig.addNunjucksGlobal("checkLangInUrls", function (lang, urls) {
		return urls.filter((x) => x.lang == lang).length > 0
	});

	eleventyConfig.addNunjucksGlobal("startWithLocale", function (lang, path) {
		if (path === false && this.page.lang == lang) return true;
		if (path.startsWith(`/${lang}/`) || path.startsWith(`/feed/`)) {
			return true
		}
		return false
	});


	eleventyConfig.addFilter("onlyLocale", function (data, lang) {
		return data.filter((x) => x.url.startsWith(`/${lang}/`) || x.url.startsWith(`/feed/`))
	});

	eleventyConfig.addFilter("github_md", (data) => {
		data = data.replace("## What's Changed", '');
		data = gfmLinks(data, 'deepnest-next/deepnest');
		return marked.parse(data);
	})

	eleventyConfig.addFilter('localeName', (data) => {
		const _intl = new Intl.DisplayNames([data || "en"], { type: "language" });
		return _intl.of(data)
	})

	eleventyConfig.addFilter('localeNameFrom', (data, lang) => {
		const _intl = new Intl.DisplayNames([lang || "en"], { type: "language" });
		return _intl.of(data)
	})


	eleventyConfig.addFilter('fileSize', function (bytes, si = false, dp = 1) {
		const thresh = si ? 1000 : 1024;

		if (Math.abs(bytes) < thresh) {
			return bytes + ' B';
		}

		const units = si
			? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
			: ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
		let u = -1;
		const r = 10 ** dp;

		do {
			bytes /= thresh;
			++u;
		} while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


		return bytes.toFixed(dp) + ' ' + units[u];
	})

	eleventyConfig.addFilter("jsonDump", (data) => {
		return JSON.stringify(data, null, 4);
	})

	eleventyConfig.addFilter("readableDate", (dateObj, format, zone, lang) => {
		// Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
		return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(format || "dd LLLL yyyy", { locale: lang || "en" });
	});

	eleventyConfig.addFilter("readableISODate", (dateObj, format, lang) => {
		// Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
		return DateTime.fromISO(dateObj).toFormat(format || "dd LLLL yyyy", { locale: lang || "en" });
	});

	eleventyConfig.addFilter("htmlDateString", (dateObj) => {
		// dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
		return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat('yyyy-LL-dd');
	});

	eleventyConfig.addFilter("htmlISODateString", (dateObj) => {
		// dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
		return DateTime.fromISO(dateObj).toFormat('yyyy-LL-dd');
	});

	// Get the first `n` elements of a collection.
	eleventyConfig.addFilter("head", (array, n) => {
		if (!Array.isArray(array) || array.length === 0) {
			return [];
		}
		if (n < 0) {
			return array.slice(n);
		}

		return array.slice(0, n);
	});

	// Return the smallest number argument
	eleventyConfig.addFilter("min", (...numbers) => {
		return Math.min.apply(null, numbers);
	});

	// Return the keys used in an object
	eleventyConfig.addFilter("getKeys", target => {
		return Object.keys(target);
	});

	eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
		return (tags || []).filter(tag => ["all", "posts"].indexOf(tag) === -1);
	});

	eleventyConfig.addFilter("sortAlphabetically", strings =>
		(strings || []).sort((b, a) => b.localeCompare(a))
	);
};
