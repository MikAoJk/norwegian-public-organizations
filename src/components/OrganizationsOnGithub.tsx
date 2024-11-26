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
            <h1 className="text-l md:text-4xl font-extrabold mb-8 md:mb-12 text-center">Norwegian public organizations on GitHub</h1>
                    {organizationsWithReposByRepoNumber &&
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

