# Deployment (Cloudflare Pages)

Cloudflare Pages (project `deepnest-net`) builds the site on every push: `main` goes to production, other branches and PRs get a preview. The build runs `yarn build` with the Node version from `.nvmrc`.

## Environment variables

Set in Cloudflare: **Workers & Pages → deepnest-net → Settings → Variables and Secrets**. Locally, the same names can go into a `.env` file (git-ignored; loaded by `@dotenvx/dotenvx`).

| Name | Used by | Without it |
|---|---|---|
| `GITHUB_TOKEN` | `_data/githubOrg.js`, `_data/githubOrgReleases.js` (org repos and releases), `_data/sponsors.js` (GitHub Sponsors) | Repos/releases still load (public data), but the GitHub sponsors stay empty. An **invalid or expired** token breaks the build (see below). |
| `PATREON_TOKEN`, `PATREON_CAMPAIGN_ID` | `_data/sponsors.js` (Patreon members) | Patreon sponsors stay empty; the build continues |
| `BUILD_MODE` | `_data/metadata.js`: site URL (`production` → `https://www.deepnest.net/`, `devel_cf` → `https://devel.deepnest-net.pages.dev/`) | URL falls back to `http://localhost:8080/` (links in sitemap and feeds point there) |

### Symptoms of a bad `GITHUB_TOKEN`

**Token lifetime too long (403):** the token works, but the organization refuses it:

```
GET /orgs/deepnest-next/repos?type=public&per_page=100 - 403 ...
[11ty] The 'deepnest-next' organization forbids access via a personal access tokens (classic)
       if the token's lifetime is greater than 366 days. Please adjust your token's lifetime at
       the following URL: https://github.com/settings/tokens/<id>
```

Fix: open that URL → **Regenerate token** → pick an expiration of at most 366 days → **Regenerate token**. The scopes stay the same, but the value changes, so save the new value in Cloudflare again (see "Save it in Cloudflare").

Leaving the token out is no workaround. Without it the API allows only 60 requests per hour, and `_data/githubOrgReleases.js` alone needs one request per org repository (about 30) and more. The sponsors query does not work without a token at all.

**Wrong or expired token (401):** the build stops early with:

```
GET /orgs/deepnest-next/repos?type=public&per_page=100 - 401 ...
[11ty] Bad credentials - https://docs.github.com/rest (via HttpError)
    at async RemoteAssetCache.fetchRepos (file:///opt/buildhome/repo/_data/githubOrg.js:12:19)
```

GitHub answers a wrong or expired token with 401 even for public data, while no token at all would work. Fix: create a new token and replace it in Cloudflare (next sections).

## Create the GitHub token

The token must belong to an **owner of the deepnest-next organization**. Private sponsorships (`includePrivate: true`) and the tier details (`adminInfo`) are only visible to people who can administer the org's Sponsors listing.

1. GitHub → avatar → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)** → **Generate new token (classic)**
   (direct link: <https://github.com/settings/tokens/new>).
2. **Note:** `deepnest.net Cloudflare build`
3. **Expiration:** at most **366 days**. Choose a preset or **Custom** with a date less than a year away, but **not "No expiration"**. The deepnest-next organization refuses classic tokens that live longer (see "Symptoms" below). Put the date in a calendar; GitHub also sends an e-mail before the token expires. An expired token breaks the build the same way as a wrong one.
4. **Scopes:** check only
   - `read:user`: the Sponsors fields `isActive`, `createdAt`, `isOneTimePayment` require it (GitHub reports `INSUFFICIENT_SCOPES ... requires one of the following scopes: ['read:user']` without it)
   - `read:org`: reading the organization's data
5. **Generate token** and copy it (`ghp_…`). It is shown only once.

Why classic: GitHub's scope errors for the Sponsors API name classic scopes. A fine-grained token was not tested.

Checked on 2026-11-20: without `read:user` the sponsors query fails. A token with `admin:org` (which includes `read:org`) but without `read:user` got exactly the `read:user` errors and no others. A token with exactly `read:user` + `read:org` has not been tried yet, so run the test below before you save it.

## Test the token before you save it

```sh
read -rs GITHUB_TOKEN && export GITHUB_TOKEN   # paste the token; it stays out of the shell history
curl -s -H "Authorization: bearer $GITHUB_TOKEN" https://api.github.com/graphql \
  -d '{"query":"{ organization(login: \"deepnest-next\") { sponsorshipsAsMaintainer(first: 1, includePrivate: true) { totalCount nodes { isActive tier { adminInfo { isRetired } } } } } }"}'
curl -s -H "Authorization: bearer $GITHUB_TOKEN" "https://api.github.com/orgs/deepnest-next/repos?type=public&per_page=1" | head -c 300; echo
```

| Answer | Meaning |
|---|---|
| first command: `{"data":{"organization":{"sponsorshipsAsMaintainer":{"totalCount":…`, second: a list starting with `[{"id":…` | good |
| `"Bad credentials"` | token wrong or expired |
| `"type":"INSUFFICIENT_SCOPES"` | a scope is missing; the message names it |
| `forbids access via a personal access tokens (classic) if the token's lifetime is greater than 366 days` | expiration too long: regenerate the token with at most 366 days |

Optional, the full build with this token: `yarn install && yarn build` (the variable exported above is used).

## Save it in Cloudflare

1. <https://dash.cloudflare.com> → **Workers & Pages** → **deepnest-net** → **Settings** → **Variables and Secrets**.
2. Edit `GITHUB_TOKEN` (or **Add** it), paste the new value, choose **Encrypt** so it is stored as a secret, **Save**.
3. Do this for **Production** and **Preview**, otherwise PR previews keep failing.
4. A new value applies only to new builds. Start one: **Deployments** → the failed deployment → **Retry deployment**, or push a commit.
5. When the build is green, delete the old token on GitHub (<https://github.com/settings/tokens>).

## Renewing

Same steps: create a new token, test it, replace it in Cloudflare (Production and Preview), rebuild, then delete the old token.
