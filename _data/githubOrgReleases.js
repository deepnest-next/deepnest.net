// _data/repos.js
import { Octokit } from "@octokit/rest";
import '@dotenvx/dotenvx/config';
import EleventyFetch from "@11ty/eleventy-fetch";

async function fetchRepos() {
    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN,
    });

    // Alle Repositories der Organisation abrufen (automatisches Paging)
    const repos = await octokit.paginate(octokit.repos.listForOrg, {
        org: "deepnest-next", // Passe den Namen an
        type: "public",
        per_page: 100,
    });

    // Archivierte Repositories und Forks herausfiltern
    const activeRepos = repos.filter(repo =>
        !repo.archived &&
        !repo.fork &&
        repo.name !== '.github' &&
        repo.name !== 'deepnest.net'
    );

    // Für jedes aktive Repository die Releases abrufen (ebenfalls mit Paging)
    const reposWithReleases = await Promise.all(
        activeRepos.map(async (repo) => {
            const releases = await octokit.paginate(octokit.repos.listReleases, {
                owner: repo.owner.login,
                repo: repo.name,
                per_page: 100,
            });
            return {
                ...repo,
                releases,
            };
        })
    );

    reposWithReleases.sort((a, b) => {
        if (a.name === "deepnest") return -1;
        if (b.name === "deepnest") return 1;
        return a.name.localeCompare(b.name);
    });

    return reposWithReleases;
}

export default async function () {
    // Mit Eleventy Fetch wird das Ergebnis von fetchRepos für einen Tag gecached.
    let data = await EleventyFetch(fetchRepos, {
        duration: "1d", // Cache-Dauer: 1 Tag
        type: "json",    // Speichert die Daten als JSON
        requestId: "github_deepnest-next_reposrelease" // Eindeutige ID für den Cache
    });
    return data;
};