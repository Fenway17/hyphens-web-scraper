// main entry point for api request web scraper
const axios = require("axios");
require("dotenv").config({ path: "./.env" });
const fs = require("fs").promises;
const JsonWriter = require("../json-writer");
const JsonToCsv = require("../json-to-csv");
const httpRequest = require("./http-request");

const jsonFilePath = "data.json";
const csvFilePath = "data.csv";

(async function main() {
    let count = 1;
    let pageNum = 1;
    while (true) {
        let packetData = await httpRequest.fetchHTMLData();
        // console.log("- packetDictData:");
        // console.log(packetDictData); // check data

        console.log(`- checking page ${pageNum} results`);

        break;
        pageNum++; // go to next page
    }
    // // write json writer data to json file
    // await JsonWriter.writeDataToFile();

    // // convert json to csv
    // const jsonData = await fs.readFile(jsonFilePath, "utf8");
    // const jsonDict = JSON.parse(jsonData);
    // // convert json dict into a json list for better csv formatting
    // let jsonList = [];
    // for (const key in jsonDict) {
    //     // filter out inherited properties from prototype
    //     if (jsonDict.hasOwnProperty(key)) {
    //         // console.log(`${key}: ${JSON.stringify(jsonDict[key])}`);
    //         jsonList.push(jsonDict[key]);
    //     }
    // }
    // await JsonToCsv.writeJsonObjectToCsv(jsonList, csvFilePath);
})();
