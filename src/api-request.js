// main entry point for api request web scraper
const axios = require("axios");
require("dotenv").config({ path: "./.env" });
const fs = require("fs").promises;
const JsonWriter = require("./json-writer");
const JsonToCsv = require("./json-to-csv");
const httpRequest = require("./http-request");

const jsonFilePath = "data.json";
const csvFilePath = "data.csv";

const PAGE_SIZE = 1000; // too large leads to error 502
const CATEGORY_ID = 61; // for outpatient medical service

let count = 1;
(async function main() {
    let pageNum = 1;
    while (true) {
        // packet example in api-request-data-example.json
        let packetData = await httpRequest.fetchListData(
            pageNum,
            PAGE_SIZE,
            CATEGORY_ID
        );
        // console.log("- packetData:");
        // console.log(packetData); // check data
        let resultsList = packetData["Results"];
        // console.log("- resultsList:");
        // console.log(resultsList);
        if (resultsList.length == 0) {
            // empty results; possibly reached the end
            break;
        }

        console.log(`- checking page ${pageNum}} results`);
        for (const result of resultsList) {
            // each result is a dict of info
            console.log(`- result: ${count}`);
            // console.log(result);

            // copy data over
            centreData = result;

            let HCICode = result["HciCode"];
            // console.log(HCICode);

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

            // reformat specified services
            // let specifiedServices = [];
            // if (
            //     result["SpcServices"] != null &&
            //     result["SpcServices"].length > 0 &&
            //     result["LocationId"] != null
            // ) {
            //     console.log(result["SpcServices"]);
            //     let locationPacketData = await httpRequest.fetchLocationData(
            //         CATEGORY_ID,
            //         result["LocationId"]
            //     );
            //     let locationResult = locationPacketData["Results"];
            //     specifiedServices = locationResult["SpcServices"].split(",");
            //     centreData["SpcServices"] = specifiedServices;
            //     console.log(specifiedServices);
            // }

            if (HCICode != undefined) {
                // clinic info key is HCICode, a UUID
                let jsonDict = {};
                jsonDict[HCICode] = centreData;

                // write dict data to json file
                await JsonWriter.jsonWrite(jsonDict);
            }
            count++;
        }

        // break
        pageNum++; // go to next page
    }

    // convert json to csv
    const jsonData = await fs.readFile(jsonFilePath, "utf8");
    const jsonDict = JSON.parse(jsonData);
    // convert json dict into a json list for better csv formatting
    let jsonList = [];
    for (const key in jsonDict) {
        if (jsonDict.hasOwnProperty(key)) {
            // console.log(`${key}: ${JSON.stringify(jsonDict[key])}`);
            jsonList.push(jsonDict[key]);
        }
    }
    await JsonToCsv.writeJsonObjectToCsv(jsonList, csvFilePath);
})();
