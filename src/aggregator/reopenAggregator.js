export const reopenAggregator = (events) => {
    if(events == null || events.length === 0) {
        return null;
    }
    const reopenEvents = events.filter(event => event.event === "reopened");
    return reopenEvents.length;
}