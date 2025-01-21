'use server';

import {Octokit} from "@octokit/core";
import {paginateRest} from "@octokit/plugin-paginate-rest";
import {retry} from "@octokit/plugin-retry";


async function getNumberOfPublicRepos(owner: string): Promise<number> {

    const octokitplugin = Octokit.plugin(paginateRest, retry).defaults({
        userAgent: "norwegian-public-organizations",
        auth: process.env.GH_TOKEN
    });

    const myOctokit = new octokitplugin()

    try {
        const repos = await myOctokit.request(`GET /orgs/${owner}`, {
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        })

        return repos.data.public_repos
    } catch (e) {
        console.log(e)
        return 0
    }
}

export default getNumberOfPublicRepos

