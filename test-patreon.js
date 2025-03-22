import {
	buildQuery,
	normalize,
	PatreonCreatorClient,
	PatreonWebhookTrigger,
	simplify,
} from "patreon-api.ts";

import "@dotenvx/dotenvx/config";

const client = new PatreonCreatorClient({
	oauth: {
		clientId: process.env.PATREON_CLIENT_ID,
		clientSecret: process.env.PATREON_CLIENT_SECRET,
		token: {
			access_token: process.env.PATREON_ACCESS_TOKEN,
			refresh_token: process.env.PATREON_REFRESH_TOKEN,
		},
	},
	rest: {
		includeAllQueries: true,
		globalRequestPerSecond: 4,
		fetch: (url, init) => {
			console.log(`[${init.method}] ${url}`);
			if (init.body) console.log(init.body);

			return fetch(url, init);
		},
	},
});

const campaigns = await client.fetchCampaigns(
	buildQuery.campaigns(["creator", "benefits", "goals", "tiers"])(),
);
console.log(
	JSON.stringify(campaigns, null, 4),
	//JSON.stringify(normalize(campaigns), null, 4),
	//JSON.stringify(simplify(campaigns), null, 4),
);

const campaignMembers = await client.fetchCampaignMembers(
	process.env.PATREON_CAMPAIGN_ID,
	buildQuery.campaignMembers([
		"user",
		"currently_entitled_tiers",
		"pledge_history",
		"address",
		"campaign",
	])(),
);
console.log(
	JSON.stringify(campaignMembers, null, 4),
	//JSON.stringify(normalize(campaignMembers), null, 4),
	//JSON.stringify(simplify(campaignMembers), null, 4),
);


const createWebhook = false;

if (createWebhook) {
	const test = await client.webhooks.createWebhook({
		campaignId: process.env.CAMPAIGN_ID,
		triggers: [PatreonWebhookTrigger.PostPublished],
		uri: process.env.WEBHOOK_URI,
	});

	console.log(JSON.stringify(test, null, 4));
} else {
	const webhooks = await client.webhooks.fetchWebhooks(
		buildQuery.webhooks(["campaign"])(),
	);

	for (const webhook of webhooks.data) {
		if (webhook.attributes.paused) {
			await client.webhooks.unpauseWebhook(webhook.id);
		}
	}

	console.log(JSON.stringify(webhooks, null, 4));
}
