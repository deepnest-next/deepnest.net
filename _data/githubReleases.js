import Fetch from "@11ty/eleventy-fetch";

export default async function () {
    let url = "https://api.github.com/repos/deepnest-next/deepnest/releases";

    let json = await Fetch(url, {
        duration: "1h", // save for 1 day
        type: "json", // we’ll parse JSON for you
        verbose: true
    });

    return json;
};