import { Octokit } from "octokit";

import dotenv from 'dotenv';
dotenv.config({ path: '.env' });  
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
    throttle: { enabled: false }

});
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const nextPattern = /(?<=<)([\S]*)(?=>; rel="Next")/i;
export const makeGetRequestWithPagination = async (path) => {
    let pagesRemaining = true;
    let responseData = [];
    let nextPage = path;

    while(pagesRemaining) {
        const response = await makeGetRequest(nextPage);
        responseData.push(...response.data);
        pagesRemaining = response.nextPage != null;
        nextPage = response.nextPage;
    }
    return responseData;
}

export const makeGetRequest = async (path) => {
    let pagesRemaining = true;
    let responseData = {
        data: null,
        nextPage: null,
    };
    try { 
        const response = await retriableRequest(octokit.request, [path]);
        responseData.data = response.data;
        responseData.status = response.status;
        const linkHeader = response.headers.link;
        pagesRemaining = linkHeader && linkHeader.includes(`rel=\"next\"`);

        if (pagesRemaining) {
            responseData.nextPage = linkHeader.match(nextPattern)[0];
        }            
    }
    catch (error) {
        console.log('Error fetching events:', error);
        throw error;
    }

    return responseData;
}

const retriableRequest = async (func, args) => {
    await waitUntilReset();

    let attempt = 1;
    while (true) {
        try {
            return await func(...args);
        } catch (error) {
            if (attempt === 3) {
                throw error;
            }
            attempt++;
        }
    }
}


const waitUntilReset = async () => {
    const response = await octokit.request('GET /rate_limit');
    const remaining = response.data.resources.core.remaining;
    if (remaining > 0) {
        return;
    }
    const reset = new Date(response.data.resources.core.reset * 1000); 
    const now = new Date();
    const diff = reset.getTime() - now.getTime();
    console.log(`Rate limit was reached waiting for ${reset} (${diff}ms)`);
    await sleep(diff);
}