import { markdown } from "../_config/filters.js";
export const data = {
	layout: false,
	permalink: "/app_notifications.json",
	eleventyExcludeFromCollections: true,
}

export function render(data) {
	var json = data.collections.notification.map(function (item) {
		return {
			title: item.data.title,
			type: item.data.category,
			date: item.date,
			uuid: item.page.filePathStem.replaceAll('/', '_').replace(/^_en_/g, '').replace(/^_+|_+$/g, '').trim(),
			content: function () { return markdown(item.content) }(),
		};
	});
	console.log(Object.keys(data));
	return JSON.stringify({
		"notifications": json,
		"meta": {
			"lastUpdated": new Date().toISOString(),
			"version": data.githubData.releases[0].tag_name.replace(/^v/g, '').trim(),
		}
	});
}

