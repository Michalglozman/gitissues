export const labelAggregator = (events) => {
    const labelEvents = events.filter(event => event.event === "labeled" || event.event === "unlabeled");
    const labelTime = {};
    for(let i = labelEvents.length - 1; i > 0; i--) {
        const currentLabel = labelEvents[i-1];
        const changedLabel = labelEvents[i];
        if (Object.keys(labelTime).includes(currentLabel.labelName)) {
            labelTime[currentLabel.labelName] += changedLabel.created_at - currentLabel.created_at;
        } else {
            labelTime[currentLabel.labelName] = changedLabel.created_at - currentLabel.created_at;
        }
    }
    return labelTime;
}