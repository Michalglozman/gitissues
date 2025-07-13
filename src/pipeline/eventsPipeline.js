import { fetchEvents } from "../fetcher/eventsFetcher.js";
import { fetchRepos } from "../fetcher/repoFetcher.js";
import { insertEventsBatch, getEventsByIssueId } from "../db/eventData.js";
import { fetchIssues } from "../fetcher/issueFetcher.js";
import { timelineAggregator } from "../aggregator/timelineAggregator.js";
import { finalResolutionAggregator } from "../aggregator/finalResolution.js";
import { reopenAggregator } from "../aggregator/reopenAggregator.js";
import { labelAggregator } from "../aggregator/labelAggregator.js";
import { insertIssuesBatch } from "../db/eventData.js";
import pLimit from 'p-limit';

export const run = async (org, since) => {
    console.log("Fetching events for org:", org, "since:", since);
    const repos = await fetchRepos(org);
    console.log("Repos fetched:", repos.length);
    const limit = pLimit(100);
    console.log("Fetching issues for org:", org, "since:", since);
    const tasks = repos.map(repo =>
      limit(() => fetchIssues(org, repo, since))
    );
    
    let issues = await Promise.all(tasks);
    issues = issues.filter(issue => issue.length > 0).flat();
    console.log("Issues fetched:", issues.length);
    console.log("Fetching events for org:", org);
    const eventsByIssue = []
    const eventTasks = issues.map(issue =>
        limit(() => fetchEvents(org, issue.repositoryName, issue))
    );
    
    let events = await Promise.all(eventTasks);
    events = events.filter(e => e !== null && e.length > 0);
    eventsByIssue.push(...events);

    console.log("Events fetched:", eventsByIssue.length);
    try {
        for (const events of eventsByIssue) {
            await insertEventsBatch(events, 5000);
        }
        console.log("All events have been saved to database");
    } catch (error) {
        console.error("Error saving to database:", error);
        throw error;
    }
    const aggregatedIssues = [];
    issues.forEach( issue => {
        const events = getEventsByIssueId(issue.issueId);
        const aggregatedIssue = {
            issueId: issue.issueId,
            issueNumber: issue.issueNumber,
            timeline: timelineAggregator(events),
            finalResolution: finalResolutionAggregator(events),
            reopenCount: reopenAggregator(events),
            timeSpentInLabels: labelAggregator(events)
        }
        aggregatedIssues.push(aggregatedIssue);
    });
    console.log("Events loaded:", aggregatedIssues.length);

    insertIssuesBatch(aggregatedIssues);
}
