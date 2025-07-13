import { makeGetRequestWithPagination } from "../api/githubApi.js";
import { getNewestEventDateByIssueId } from "../db/eventData.js";

export const fetchEvents = async (org, repo, issue) => {
    let url = `https://api.github.com/repos/${org}/${repo}/issues/${issue.issueNumber}/events`;

    let issueEvents = [];

    const latestEvent = getNewestEventDateByIssueId(issue.issueId);
    const latestEventDate = latestEvent ? new Date(latestEvent) : null;
    if(new Date(issue.updatedAt) <= latestEventDate) {
        return issueEvents;
    }
        
        const response = await makeGetRequestWithPagination(`GET ${url}`);
        
        if (response.length === 0) {
            return issueEvents;
        }
        
        for (let i = 0; i < response.length; i++) {
            const event = response[i];
            const eventDate = new Date(event.created_at);
            
            if (latestEventDate == null || eventDate > latestEventDate) {
                    const filteredEvent = {
                        id: event.id,
                        event: event.event,
                        created_at: event.created_at,
                        issueId: issue.issueId,
                        issueNumber: issue.issueNumber,
                        actorId: event.actor?.id,
                        actorType: event.actor?.type,
                        actorLogin: event.actor?.login,
                        repositoryName: repo,
                        labelName: event.label?.name,
                    };
                    issueEvents.push(filteredEvent);
            } else {
                return issueEvents;
            }
        }

    return issueEvents;
}