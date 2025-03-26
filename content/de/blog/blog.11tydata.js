export default {
	lang: "de",
  draft: true,
	layout: "layouts/post.njk",
	permalink: function (data) {
		// Slug override for localized URL slugs
		if (data.slugOverride) {
			return `/${data.lang}/blog/${this.slugify(data.slugOverride)}/`;
		}
	}
};
