const axios = require("axios");
require("dotenv").config({ path: "./.env" });

const API_URL_LOCATION_LIST = process.env.API_URL_LOCATION_LIST;
const API_URL_LOCATION = process.env.API_URL_LOCATION;
const HEADER_ORIGIN = process.env.HEADER_ORIGIN;
const HEADER_REFERER = process.env.HEADER_REFERER;
const HEADER_X_API_KEY = process.env.HEADER_X_API_KEY;

// fetch data through http request and return it
async function fetchListData(pageNum, pageSize, categoryId, retries = 3) {
    console.log("- fetching list data...");
    const options = {
        method: "GET",
        url: API_URL_LOCATION_LIST,
        params: {
            pageNum: pageNum,
            pageSize: pageSize,
            categoryId: categoryId,
        },
        headers: {
            Accept: "application/json, text/plain, */*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US,en;q=0.9",
            Origin: HEADER_ORIGIN,
            Referer: HEADER_REFERER,
            "Sec-Ch-Ua":
                '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": '"Windows"',
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site",
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            "X-Api-Key": HEADER_X_API_KEY,
            "X-Hh-Agent": "portal-hhngreact",
        },
    };

    for (let i = 0; i < retries; i++) {
        try {
            let response = await axios.request(options);
            console.log("- list response data successfully retrieved.");
            return response.data;
        } catch (error) {
            if (error.code === "ECONNRESET" && i < retries - 1) {
                // connection reset by peer
                console.warn(`Retrying... (${i + 1}/${retries})`);
            } else {
                console.error("Error fetching data:", error.message);
                throw error;
            }
        }
    }
}

("?categoryId=61&locationId=110707");

async function fetchLocationData(categoryId, locationId, retries = 3) {
    console.log("- fetching location data...");
    // Define the URL and query parameters
    const options = {
        method: "GET",
        url: API_URL_LOCATION,
        params: {
            categoryId: categoryId,
            locationId: locationId,
        },
        headers: {
            Accept: "application/json, text/plain, */*",
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
            "X-Api-Key": HEADER_X_API_KEY,
            "X-Hh-Agent": "portal-hhngreact",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site",
            Referer: HEADER_REFERER,
            Origin: HEADER_ORIGIN,
            "Sec-Ch-Ua":
                '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": '"Windows"',
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US,en;q=0.9",
            Priority: "u=1, i",
        },
    };

    // request with axios.request
    for (let i = 0; i < retries; i++) {
        try {
            let response = await axios.request(options);
            console.log("- location response data successfully retrieved.");
            return response.data;
        } catch (error) {
            if (error.code === "ECONNRESET" && i < retries - 1) {
                // connection reset by peer
                console.warn(`Retrying... (${i + 1}/${retries})`);
            } else {
                console.error("Error fetching data:", error.message);
                throw error;
            }
        }
    }
}

module.exports = {
    fetchListData,
    fetchLocationData,
};
