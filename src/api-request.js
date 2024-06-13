const axios = require("axios");
require("dotenv").config({ path: "./.env" });
const fs = require("fs").promises;
const JsonWriter = require("./json-writer");
const JsonToCsv = require("./json-to-csv");

const API_URL = process.env.API_URL;
const HEADER_ORIGIN = process.env.HEADER_ORIGIN;
const HEADER_REFERER = process.env.HEADER_REFERER;
const HEADER_X_API_KEY = process.env.HEADER_X_API_KEY;

const jsonFilePath = "data.json";
const csvFilePath = "data.csv";

const PAGE_SIZE = 100; // too large leads to error 502
const CATEGORY_ID = 61; // for outpatient medical service

(async function main() {
    let pageNum = 1;
    while (true) {
        // packet example in api-request-data-example.json
        let packetData = await fetchData(pageNum, PAGE_SIZE, CATEGORY_ID);
        // console.log("- packetData:");
        // console.log(packetData); // check data
        let resultsList = packetData["Results"];
        // console.log("- resultsList:");
        // console.log(resultsList);
        if (resultsList.length == 0) {
            // empty results; possibly reached the end
            break;
        }
        for (const result of resultsList) {
            console.log("- checking results");
            // console.log("- result:");
            // console.log(result);
            let name = result["Name"];
            console.log(name);
            let location = result["Address"];
            let HCICode = result["HciCode"];
            console.log(HCICode);
            let phoneNumber = result["TelephoneNumber"];
            console.log(phoneNumber);
            let email = result["Email"];
            console.log(email);
            let operationalHours = {};
            if (
                result["OperatingHour"] != null &&
                result["OperatingHour"].length > 0
            ) {
                let operatingDaysList = result["OperatingHour"].split("<br/>");
                for (let listElement of operatingDaysList) {
                    if (listElement != "") {
                        let keyValue = listElement.split(" : ");
                        operationalHours[keyValue[0].trim()] =
                            keyValue[1].trim();
                    }
                }
            }
            console.log(operationalHours);
            let specifiedServices = [];
            if (
                result["SpcServices"] != null &&
                result["SpcServices"].length > 0
            ) {
                specifiedServices = result["SpcServices"].split(",");
            }
            console.log(specifiedServices);

            if (HCICode != undefined) {
                // create object to hold the data
                let centreData = {
                    name: name,
                    location: location === undefined ? null : location,
                    HCICode: HCICode === undefined ? null : HCICode,
                    operational_hours: operationalHours,
                    phone_number:
                        phoneNumber === undefined ? null : phoneNumber,
                    email: email === undefined ? null : email,
                    specified_services:
                        specifiedServices.length == 0
                            ? null
                            : specifiedServices,
                };

                // clinic info key is HCICode, a UUID
                let jsonDict = {};
                jsonDict[HCICode] = centreData;

                // write dict data to json file
                await JsonWriter.jsonWrite(jsonDict);
            }
        }

        break;
        pageNum++; // go to next page
    }
    // convert json to csv
    const jsonData = await fs.readFile(jsonFilePath, "utf8");
    const jsonDict = JSON.parse(jsonData);
    // convert json dict into a json list for better csv formatting
    let jsonList = [];
    for (const key in jsonDict) {
        if (jsonDict.hasOwnProperty(key)) {
            console.log(`${key}: ${JSON.stringify(jsonDict[key])}`);
            jsonList.push(jsonDict[key]);
        }
    }
    await JsonToCsv.writeJsonObjectToCsv(jsonList, csvFilePath);
    // await JsonToCsv.writeJsonToCsv(jsonFilePath, csvFilePath);
})();

// fetch data through http request and return it
async function fetchData(pageNum, pageSize, categoryId) {
    console.log("- fetching data...");
    const options = {
        method: "GET",
        url: API_URL,
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

    try {
        let response = await axios.request(options);
        console.log("- response data successfully retrieved.");
        return response.data;
    } catch (error) {
        console.error("Error:", error.message);
        throw error;
    }
}
