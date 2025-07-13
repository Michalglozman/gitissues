import { makeGetRequestWithPagination } from "../api/githubApi.js";

export const fetchIssues = async (org, repo, since) => {
    const url = `https://api.github.com/repos/${org}/${repo}/issues?since=${since}&state=all`;
    const response = await makeGetRequestWithPagination(`GET ${url}`);
    const issues = response.map(issue => {
                    return {
                        id: issue.id,
                        issueState: issue.state,
                        createdAt: issue.created_at,
                        updatedAt: issue.updated_at,
                        issueId: issue.id,
                        issueNumber: issue.number,
                        repositoryName: repo,
                    };
    });
    return issues;
}