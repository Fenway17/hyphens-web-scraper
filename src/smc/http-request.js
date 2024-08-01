const axios = require("axios");
const qs = require("qs");
require("dotenv").config({ path: "./.env" });

const API_URL_HTML_LIST = process.env.SMC_API_URL_HTML_LIST;
const API_URL_HTML_DOCTOR = process.env.SMC_API_URL_HTML_DOCTOR;
const HEADER_HOST = process.env.SMC_HEADER_HOST;
const HEADER_ORIGIN = process.env.SMC_HEADER_ORIGIN;
const HEADER_REFERER = process.env.SMC_HEADER_REFERER;
const HEADER_COOKIE = process.env.SMC_HEADER_COOKIE;

// fetch data through http request and return it
async function fetchListHtmlData(retries = 3) {
    console.log("Axios HTTP: fetching list data...");

    const options = {
        method: "post",
        url: API_URL_HTML_LIST,
        headers: {
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US,en;q=0.9",
            "Cache-Control": "max-age=0",
            Connection: "keep-alive",
            Cookie: HEADER_COOKIE,
            Host: HEADER_HOST,
            "sec-ch-ua":
                '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Upgrade-Insecure-Requests": "1",
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        },
    };

    try {
        const response = await axios.request(options);
        console.log("Axios HTTP: HTML response data successfully retrieved.");
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Axios HTTP: Error fetching data:", error.message);
    }
}

async function fetchDoctorHtmlData(code, cookieString, retries = 3) {
    console.log(`Axios HTTP: fetching HTML data; code: ${code} ...`);

    // Define the URL and query parameters
    const options = {
        method: "POST",
        url: API_URL_HTML_DOCTOR,
        headers: {
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US,en;q=0.9",
            "Cache-Control": "max-age=0",
            Connection: "keep-alive",
            "Content-Type": "application/x-www-form-urlencoded",
            Cookie: cookieString,
            Host: HEADER_HOST,
            Origin: HEADER_ORIGIN,
            Referer: HEADER_REFERER,
            "sec-ch-ua":
                '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-User": "?1",
            "Upgrade-Insecure-Requests": "1",
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        },
        data: qs.stringify({
            hpe: "SMC",
            regNo: code,
            "psearchParamVO.language": "eng",
            "psearchParamVO.searchBy": "N",
            "psearchParamVO.name": "",
            "psearchParamVO.pracPlaceName": "",
            "psearchParamVO.regNo": "",
            selectType: "all",
        }),
    };

    // Request with axios.request
    for (let i = 0; i < retries; i++) {
        try {
            let response = await axios.request(options);
            console.log(
                "Axios HTTP: HTML response data successfully retrieved."
            );
            return response.data;
        } catch (error) {
            if (error.code === "ECONNRESET" && i < retries - 1) {
                // Connection reset by peer
                console.warn(`Axios HTTP: Retrying... (${i + 1}/${retries})`);
            } else {
                console.error(
                    "Axios HTTP: Error fetching data:",
                    error.message
                );
                throw error;
            }
        }
    }
}

module.exports = {
    fetchListHtmlData,
    fetchDoctorHtmlData,
};
