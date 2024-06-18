const fs = require("fs").promises;
const httpRequest = require("./http-request");
const apiRequest = require("./api-request");

// path to JSON file
const jsonFilePath = "data.json";
const CATEGORY_ID = 61;

class JsonWriter {
    // temporary dict of all stored data to improve runtime complexity
    static existingDictData = {};
    // pairings of code to service name
    static spcServicesCodePairings = {};

    static async jsonWriterAdd(dictStringToAdd) {
        try {
            let keys = Object.keys(dictStringToAdd);
            let HCICodeKey = keys[0];
            if (HCICodeKey in this.existingDictData) {
                console.log(`- HCICode: ${HCICodeKey} already exists.`);
                return; // do not continue to store data
            }

            this.existingDictData[HCICodeKey] = dictStringToAdd[HCICodeKey];

            // let existingDictData;

            // try {
            //     const fileData = await fs.readFile(jsonFilePath, "utf8");
            //     // Parse the existing JSON content into JavaScript object
            //     existingDictData = JSON.parse(fileData);
            // } catch (error) {
            //     // Ignore error if file does not exist
            //     if (error.code !== "ENOENT") {
            //         throw error;
            //     }
            // }

            // let finalDictData = dictStringToAdd;
            // if (existingDictData != undefined) {
            //     let keys = Object.keys(dictStringToAdd);
            //     let HCICodeKey = keys[0];
            //     if (HCICodeKey in existingDictData) {
            //         console.log(
            //             `- HCICode: ${dictStringToAdd[0]} already exists.`
            //         );
            //         return; // do not continue to store data
            //     }

            //     // Combine the data objects
            //     finalDictData = {
            //         ...existingDictData,
            //         ...dictStringToAdd,
            //     };
            // }

            // await this.writeDataToFile(finalDictData);
        } catch (error) {
            console.error("Error writing to JSON file: ", err);
            return;
        }
    }

    // Function to write data to the file
    static async writeDataToFile() {
        // Convert the data to a JSON string
        // `null, 2` for pretty-printing
        let jsonString = JSON.stringify(this.existingDictData, null, 2);

        // Write the JSON string back to the file
        try {
            await fs.writeFile(jsonFilePath, jsonString, "utf8");
            console.log("Json file written to successfully");
        } catch (error) {
            console.error("Error writing to JSON file:", err);
        }
    }

    // fix the entries in data.json where specfied services are
    // tagged with a code instead of service names
    static async fixSpcServices() {
        for (let key in this.existingDictData) {
            if (
                this.existingDictData.hasOwnProperty(key) &&
                this.existingDictData[key]["SpcServices"] != null &&
                this.existingDictData[key]["SpcServices"].length > 0 &&
                this.existingDictData[key]["LocationId"] != null
            ) {
                // filter out prototype inherited properties
                // SpcServices exist
                let centreData = this.existingDictData[key];

                // console.log(centreData["SpcServices"]);
                // eg. ",S41,S43,"
                // split string by ","
                // trim to remove leading and trailing whitespaces
                // filter out empty strings
                let spcServicesList = centreData["SpcServices"]
                    .split(",")
                    .map((part) => part.trim())
                    .filter((part) => part !== "");
                // remove duplicates through Set (disallows duplicates) and spread
                spcServicesList = [...new Set(spcServicesList)];

                for (let spcServiceCode of spcServicesList) {
                    if (
                        !this.spcServicesCodePairings.hasOwnProperty(
                            spcServiceCode
                        )
                    ) {
                        // code not recorded in pairings dict
                        // check specific location page for spc service names
                        console.log(
                            `- requesting location data for: ${spcServiceCode}`
                        );
                        let packetDictData =
                            await httpRequest.fetchLocationData(
                                CATEGORY_ID,
                                centreData["LocationId"]
                            );
                        let resultDict = packetDictData["Results"];
                        let spcServicesString = resultDict["SpcServices"];
                        let spcServicesNameList = spcServicesString
                            .split(",")
                            .map((part) => part.trim())
                            .filter((part) => part !== "");
                        // populate code pairings dict
                        for (let i = 0; i < spcServicesList.length; i++) {
                            console.log(
                                `- pairing ${spcServicesList[i]} <-> ${spcServicesNameList[i]}`
                            );
                            this.spcServicesCodePairings[spcServicesList[i]] =
                                spcServicesNameList[i];
                        }
                    }
                    // code recorded before
                    spcServicesList = spcServicesList.map((item) =>
                        item === spcServiceCode
                            ? this.spcServicesCodePairings[spcServiceCode]
                            : item
                    );
                }
                this.existingDictData[key]["SpcServices"] = spcServicesList;
            }
        }
        await this.writeDataToFile();
    }
}

module.exports = JsonWriter; // export class
