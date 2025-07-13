import { run } from "./pipeline/eventsPipeline.js";

function isValidISODate(dateString) {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
    return isoDateRegex.test(dateString)
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.length !== 2) {
        console.error('Usage: node index.js <organization> <date>');
        console.error('Example: node index.js airbytehq 2025-07-11T20:00:21Z');
        process.exit(1);
    }

    const [organization, date] = args;

    // Validate date format
    if (!isValidISODate(date)) {
        console.error('Error: Invalid date format. Please use ISO 8601 format: YYYY-MM-DDThh:mm:ssZ');
        console.error('Example: 2025-07-11T20:00:21Z');
        process.exit(1);
    }

    try {
        await run(organization, date);
        console.log(`Successfully fetched events for ${organization} from ${date}`);
    } catch (error) {
        console.error('Error fetching events:', error);
        process.exit(1);
    }
}

main();