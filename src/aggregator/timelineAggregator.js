export const timelineAggregator = (events) => {
    if(events == null || events.length === 0) {
        return null;
    }
    const firstEvent = events[0];
    events = events.filter(event => event.event === 'closed' || event.event === 'reopened');
    if (events.length === 0) {
        return [];
    }
    const timeline = [{
        issueState: "open",
        event: "closed",
        timeSpan: events[0].created_at- firstEvent.created_at
    }];

    for (let i = 1; i < events.length; i++) {
        const event = events[i];    
        const prev = events[i -1];
        
        timeline.push({
            event: event.event,
            issueState: prev.event,
            timeSpan: event.created_at - prev.created_at
        });
    }
    return timeline;
};