import { DateTime } from "luxon";

export default function (eleventyConfig) {

    eleventyConfig.addNunjucksGlobal("checkLangInUrls", function (lang, urls) {
        return urls.filter((x) => x.lang == lang).length > 0
    });

    eleventyConfig.addNunjucksGlobal("startWithLocale", function (lang, path) {
        if (path.startsWith(`/${lang}/`) || path.startsWith(`/feed/`)) {
            return true
        }
        return false
    });

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
        return JSON.stringify(data, null, "\t");
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