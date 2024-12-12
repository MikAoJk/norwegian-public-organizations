'use client';

import React, {useEffect, useState} from 'react';
import organizations from "./data/organizations.json";
import {Octokit} from "@octokit/core";
import {paginateRest} from "@octokit/plugin-paginate-rest";
import {retry} from "@octokit/plugin-retry";

export interface OrganizationsJson {
    id: number;
    name: string;
    url: string;
    owner: string;
}

type OrganizationsWithRepos = {
    id: number;
    name: string;
    url: string;
    owner: string;
    repos: number
}

export const OrganizationsOnGithub = () => {
    const organizationsOnGithub: OrganizationsJson[] = organizations
    const [organizationsWithRepos, setOrganizationsWithRepos] = useState<OrganizationsWithRepos[]>([]);

    useEffect(() => {
        organizationsOnGithub.forEach(organization => (
            getNumberOfPublicRepos(organization.owner)
                .then((numberOfRepos) => {
                    setOrganizationsWithRepos(organizationsWithRepos => {
                        return [{
                            id: organization.id,
                            name: organization.name,
                            url: organization.url,
                            owner: organization.owner,
                            repos: numberOfRepos
                        }, ...organizationsWithRepos]
                    });
                })));
    }, []);

    const organizationsWithReposByRepoNumber: OrganizationsWithRepos[] = organizationsWithRepos.sort((a, b) => b.repos - a.repos)


    return (
        <div className="relative overflow-x-auto">
            <a className="flex flex-col items-center mb-4" href="https://github.com/MikAoJk/norwegian-public-organizations">
                <svg width="3em" height="3em" viewBox="0 0 98 98" xmlns="http://www.w3.org/2000/svg"
                     aria-labelledby="github-icon-title" role="img"><title id="github-icon-title">Norwegian public organizations repo on Github</title>
                    <path fillRule="evenodd" clipRule="evenodd"
                          d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
                          fill="currentColor"></path>
                </svg>
            </a>
            <h1 className="text-l md:text-4xl font-extrabold mb-8 md:mb-12 text-center">Norwegian public organizations
                on
                GitHub</h1>
            {
                organizationsWithReposByRepoNumber &&
                <table className="w-full text-sm text-left rtl:text-right">
                    <thead className="text-m uppercase">
                    <tr>
                        <th scope="col" className="px-6 py-3">Name</th>
                        <th scope="col" className="px-6 py-3">Number of repos</th>
                    </tr>
                    </thead>
                    <tbody>
                    {organizationsWithReposByRepoNumber.map(organization =>
                        <tr className="border-b dark:border-gray-700" key={organization.id}>
                            <td className="px-6 py-4">
                                <a className="text-blue-600 dark:text-blue-500 hover:underline"
                                   href={organization.url}>{organization.name}</a>
                            </td>
                            <td className="px-6 py-4">
                                {organization.repos}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            }
        </div>
    );
}


async function getNumberOfPublicRepos(owner: string): Promise<number> {
    const octokitplugin = Octokit.plugin(paginateRest, retry).defaults({
        userAgent: "norwegian-public-organizations",
        /// auth: 'mysupersecrettoken'
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

