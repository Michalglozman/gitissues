import { makeGetRequestWithPagination } from "../api/githubApi.js";

export const fetchRepos = async (org) => {
    const url = `https://api.github.com/orgs/${org}/repos`;
    const response = await makeGetRequestWithPagination(`GET ${url}`);

    return response.map(repo => repo.name);
}

fetchRepos("airbytehq");