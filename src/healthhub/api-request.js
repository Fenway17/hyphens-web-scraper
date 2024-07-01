// main entry point for api request web scraper
const axios = require("axios");
require("dotenv").config({ path: "./.env" });
const fs = require("fs").promises;
const JsonWriter = require("../json-writer");
const JsonToCsv = require("../json-to-csv");
const httpRequest = require("./http-request");

const jsonFilePath = "data.json";
const csvFilePath = "data.csv";

const PAGE_SIZE = 1000; // too large leads to error 502
const CATEGORY_ID = 61; // for outpatient medical service

(async function main() {
    let count = 1;
    let pageNum = 1;
    while (true) {
        // packet example in api-request-data-example.json
        let packetDictData = await httpRequest.fetchListData(
            pageNum,
            PAGE_SIZE,
            CATEGORY_ID
        );
        // console.log("- packetDictData:");
        // console.log(packetDictData); // check data
        let resultsList = packetDictData["Results"];
        // console.log("- resultsList:");
        // console.log(resultsList);
        if (resultsList.length == 0) {
            // empty results; possibly reached the end
            break;
        }

        console.log(`- checking page ${pageNum} results`);
        for (const result of resultsList) {
            // each result is a dict of info
            console.log(`- result no.: ${count}`);
            // console.log(result);

            // copy data over
            centreData = result;

            let HCICode = result["HciCode"];

            // reformat operation hours
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
            centreData["OperatingHour"] = operationalHours;

            if (HCICode != undefined) {
                // clinic info key is HCICode, a UUID
                let jsonDict = {};
                jsonDict[HCICode] = centreData;

                // add dict data to json writer
                await JsonWriter.jsonWriterAdd(jsonDict);
            }
            count++;
        }

        // break;
        pageNum++; // go to next page
    }
    // write json writer data to json file
    await JsonWriter.writeDataToFile();

    // fix SpcServices code-name pairings
    await JsonWriter.fixSpcServices();

    // convert json to csv
    const jsonData = await fs.readFile(jsonFilePath, "utf8");
    const jsonDict = JSON.parse(jsonData);
    // convert json dict into a json list for better csv formatting
    let jsonList = [];
    for (const key in jsonDict) {
        // filter out inherited properties from prototype
        if (jsonDict.hasOwnProperty(key)) {
            // console.log(`${key}: ${JSON.stringify(jsonDict[key])}`);
            jsonList.push(jsonDict[key]);
        }
    }
    await JsonToCsv.writeJsonObjectToCsv(jsonList, csvFilePath);
})();
