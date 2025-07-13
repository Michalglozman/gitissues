export const finalResolutionAggregator = (events) => {
    if(events == null || events.length === 0) {
        return null;
    }
    /// loop from the end if you find events[i].event = "closed" event with no events[i].event = "reopened" before this is the close event to calculate the time span 
    let isReopened = false;
    for(let i = events.length - 1; i >= 0; i--) {
        if(events[i].event === "closed" && !isReopened) {
            return events[i].created_at - events[0].created_at;
        } else if(events[i].event === "reopened") {
            isReopened = true;
            break;
        }
    }
    return null;
}
