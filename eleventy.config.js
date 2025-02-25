import { IdAttributePlugin, InputPathToUrlTransformPlugin, HtmlBasePlugin, EleventyI18nPlugin, EleventyRenderPlugin } from "@11ty/eleventy";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import pluginSyntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import pluginNavigation from "@11ty/eleventy-navigation";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

import pluginFilters from "./_config/filters.js";

// TODO: later
//import { fullwindcss } from "fullwindcss";

// Community Plugins
import externalLinks from "@aloskutov/eleventy-plugin-external-links";
import postcss from "postcss";
import postcssNested from "postcss-nested";
import tailwindcss from "@tailwindcss/postcss";


/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function (eleventyConfig) {
	// Drafts, see also _data/eleventyDataSchema.js
	eleventyConfig.addPreprocessor("drafts", "*", (data, content) => {
		if (data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
			return false;
		}
	});

	// Copy the contents of the `public` folder to the output folder
	// For example, `./public/css/` ends up in `_site/css/`
	eleventyConfig
		.addPassthroughCopy({
			"./public/": "/"
		}, {})
		.addPassthroughCopy("./content/en/feed/pretty-atom-feed.xsl")
		.addPassthroughCopy("./content/de/feed/pretty-atom-feed.xsl")
		.addPassthroughCopy("./content/nl/feed/pretty-atom-feed.xsl");

	// Run Eleventy when these files change:
	// https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

	// Watch images for the image pipeline.
	eleventyConfig.addWatchTarget("./{content,public}/**/*.{svg,webp,png,jpg,jpeg,gif}");

	// Per-page bundles, see https://github.com/11ty/eleventy-plugin-bundle
	// Adds the {% css %} paired shortcode
	eleventyConfig.addBundle("css", {
		toFileDirectory: "css/gen",
		transforms: [
			async function (content) {
				// type contains the bundle name.
				let { type, page } = this;
				let result = await postcss([postcssNested(), tailwindcss()/*TODO: later, fullwindcss*/]).process(content, { from: page.inputPath, to: null });
				return result.css;
			}
		]
	});
	// Adds the {% js %} paired shortcode
	eleventyConfig.addBundle("js", {
		toFileDirectory: "js/gen",
	});

	// Official plugins
	eleventyConfig.addPlugin(EleventyI18nPlugin, {
		// any valid BCP 47-compatible language tag is supported
		defaultLanguage: "en", // Required, this site uses "en"

		// Rename the default universal filter names
		filters: {
			// transform a URL with the current page’s locale code
			url: "locale_url",

			// find the other localized content for a specific input file
			links: "locale_links",
		},

		// When to throw errors for missing localized content files
		// errorMode: "strict", // throw an error if content is missing at /en/slug
		//errorMode: "allow-fallback", // only throw an error when the content is missing at both /en/slug and /slug
		errorMode: "never", // don’t throw errors for missing content
	});
	eleventyConfig.addPlugin(pluginSyntaxHighlight, {
		preAttributes: { tabindex: 0 }
	});
	eleventyConfig.addPlugin(pluginNavigation);
	eleventyConfig.addPlugin(HtmlBasePlugin);
	eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);
	eleventyConfig.addPlugin(EleventyRenderPlugin);

	eleventyConfig.addPlugin(feedPlugin, {
		type: "atom", // or "rss", "json"
		outputPath: "/en/feed/feed.xml",
		stylesheet: "pretty-atom-feed.xsl",
		templateData: {
			eleventyNavigation: {
				key: "Feed",
				order: 999
			}
		},
		collection: {
			name: "blog_en",
			limit: 10,
		},
		metadata: {
			language: "en",
			title: "deepnest.net - The deepnest-next Blog",
			subtitle: "This is a longer description about your blog.",
			base: "https://www.deepnest.net/",
			author: {
				name: "Josef Fröhle"
			}
		}
	});

	eleventyConfig.addPlugin(feedPlugin, {
		type: "atom", // or "rss", "json"
		outputPath: "/de/feed/feed.xml",
		stylesheet: "pretty-atom-feed.xsl",
		templateData: {
			eleventyNavigation: {
				key: "Feed",
				order: 999
			}
		},
		collection: {
			name: "blog_de",
			limit: 10,
		},
		metadata: {
			language: "de",
			title: "deepnest.net - Der deepnest-next Blog",
			subtitle: "This is a longer description about your blog.",
			base: "https://www.deepnest.net/",
			author: {
				name: "Josef Fröhle"
			}
		}
	});

	// Image optimization: https://www.11ty.dev/docs/plugins/image/#eleventy-transform
	eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		// Output formats for each image.
		formats: ["avif", "webp", "auto"],

		// widths: ["auto"],

		failOnError: false,
		htmlOptions: {
			imgAttributes: {
				// e.g. <img loading decoding> assigned on the HTML tag will override these values.
				loading: "lazy",
				decoding: "async",
			}
		},

		sharpOptions: {
			animated: true,
		},
	});

	// Filters
	eleventyConfig.addPlugin(pluginFilters);

	eleventyConfig.addPlugin(IdAttributePlugin, {
		// by default we use Eleventy’s built-in `slugify` filter:
		// slugify: eleventyConfig.getFilter("slugify"),
		// selector: "h1,h2,h3,h4,h5,h6", // default
	});


	eleventyConfig.addPlugin(externalLinks, { 'url': 'https://www.deepnest.net' });

	eleventyConfig.addShortcode("currentBuildDate", () => {
		return (new Date()).toISOString();
	});

	// Features to make your build faster (when you need them)

	// If your passthrough copy gets heavy and cumbersome, add this line
	// to emulate the file copy on the dev server. Learn more:
	// https://www.11ty.dev/docs/copy/#emulate-passthrough-copy-during-serve

	eleventyConfig.setServerPassthroughCopyBehavior("passthrough");
};

export const config = {
	// Control which files Eleventy will process
	// e.g.: *.md, *.njk, *.html, *.liquid
	templateFormats: [
		"md",
		"njk",
		"html",
		"liquid",
		"11ty.js",
	],

	// Pre-process *.md files with: (default: `liquid`)
	markdownTemplateEngine: "njk",

	// Pre-process *.html files with: (default: `liquid`)
	htmlTemplateEngine: "njk",

	// These are all optional:
	dir: {
		input: "content",          // default: "."
		includes: "../_includes",  // default: "_includes" (`input` relative)
		data: "../_data",          // default: "_data" (`input` relative)
		output: "_site"
	},

	// -----------------------------------------------------------------
	// Optional items:
	// -----------------------------------------------------------------

	// If your site deploys to a subdirectory, change `pathPrefix`.
	// Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

	// When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
	// it will transform any absolute URLs in your HTML to include this
	// folder name and does **not** affect where things go in the output folder.

	// pathPrefix: "/",
};
