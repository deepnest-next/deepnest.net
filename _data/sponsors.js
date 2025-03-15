import EleventyFetch from "@11ty/eleventy-fetch";
import '@dotenvx/dotenvx/config';

export default async function () {
    return EleventyFetch(
        async function () {
            // Umgebungsvariablen: GITHUB_TOKEN, PATREON_TOKEN, PATREON_CAMPAIGN_ID
            const githubToken = process.env.GITHUB_TOKEN;
            const patreonToken = process.env.PATREON_TOKEN;
            const patreonCampaignId = process.env.PATREON_CAMPAIGN_ID;

            // GitHub GraphQL Query: Passe "DEIN_USERNAME" an!
            const githubSponsorsQuery = `
query ($cursor: String) {
  organization(login: "deepnest-next") {
    sponsorshipsAsMaintainer(first: 100, after: $cursor, includePrivate: true) {
      totalCount
      totalRecurringMonthlyPriceInDollars
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        isOneTimePayment
        isActive
        createdAt
        sponsorEntity {
          ... on User {
            name
            login
            avatarUrl
            websiteUrl
          }
          ... on Organization {
            name
            login
            avatarUrl
            websiteUrl
            email
          }
        }
        tier {
          name
          monthlyPriceInDollars
          monthlyPriceInCents
          sponsorsListing {
            billingCountryOrRegion
          }
          description
          isOneTime
          isCustomAmount
          adminInfo {
            isRetired
          }
        }
      }
    }
  }
}
      `;

            // GitHub API-Aufruf
            const githubResponse = await fetch("https://api.github.com/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `bearer ${githubToken}`
                },
                body: JSON.stringify({ query: githubSponsorsQuery })
            });
            const githubData = await githubResponse.json();
            console.log(githubData);
            const totalRecurringMonthlyPriceInDollars = githubData.data?.organization?.sponsorshipsAsMaintainer?.totalRecurringMonthlyPriceInDollars || 0;
            const githubSponsors = githubData.data?.organization?.sponsorshipsAsMaintainer?.nodes || [];

            // Patreon API-Aufruf
            const patreonUrl = `https://www.patreon.com/api/oauth2/v2/campaigns/${patreonCampaignId}/members?include=user`;
            const patreonResponse = await fetch(patreonUrl, {
                headers: {
                    "Authorization": `Bearer ${patreonToken}`
                }
            });
            const patreonData = await patreonResponse.json();

            // Extrahiere relevante Felder aus den Patreon-Daten
            const patreonSponsors = (patreonData.data || []).map(member => ({
                id: member.id,
                attributes: member.attributes
            }));

            // Rückgabe der kombinierten Daten
            return {
                github: githubSponsors,
                githubTotalMonthly: totalRecurringMonthlyPriceInDollars,
                patreon: patreonSponsors
            };
        },
        {
            duration: "1d", // Cache-Dauer: 1 Tag
            type: "json",
            requestId: "sponsors_github_patreon",
        }
    );
}