const fs = require("fs").promises;
const httpRequest = require("./healthhub/http-request");

// path to JSON file
const jsonFilePath = "data.json";
const CATEGORY_ID = 61;

class JsonWriter {
    // temporary dict of all stored data; to improve runtime complexity
    static existingDictData = {};
    // pairings of code to service name; to reduce number of HTTP requests sent
    static spcServicesCodePairings = {};

    static async jsonWriterAdd(dictStringToAdd) {
        try {
            let keys = Object.keys(dictStringToAdd);
            let HCICodeKey = keys[0];
            if (HCICodeKey in this.existingDictData) {
                console.log(`--- HCICode: ${HCICodeKey} already exists.`);
                return; // do not continue to store data
            }

            this.existingDictData[HCICodeKey] = dictStringToAdd[HCICodeKey];
        } catch (error) {
            console.error("Error writing to JSON file: ", err);
            return;
        }
    }

    // Function to write data to the file
    static async writeDataToFile() {
        // convert the data to a JSON string
        // `null, 2` for pretty-printing
        let jsonString = JSON.stringify(this.existingDictData, null, 2);

        // write the JSON string back to the file
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
            // check all entries with defined spc-services lists
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
                let spcServicesCodeList = centreData["SpcServices"]
                    .split(",")
                    .map((part) => part.trim())
                    .filter((part) => part !== "");

                // remove duplicates through Set (disallows duplicates) and spread
                spcServicesCodeList = [...new Set(spcServicesCodeList)];

                let keyCodesToRemove = [];
                for (let spcServiceCode of spcServicesCodeList) {
                    // start code to name pairing attempts
                    if (
                        !this.spcServicesCodePairings.hasOwnProperty(
                            spcServiceCode
                        )
                    ) {
                        // code not recorded in pairings dict
                        // check specific location page for spc service names
                        console.log(
                            `- requesting location data for code: ${spcServiceCode}`
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
                        for (let i = 0; i < spcServicesCodeList.length; i++) {
                            // check current name pairing
                            let currentCode = spcServicesCodeList[i];
                            let currentNamePairing =
                                this.spcServicesCodePairings[currentCode];
                            let newNamePairing = spcServicesNameList[i];
                            if (
                                currentNamePairing == undefined &&
                                newNamePairing != undefined
                            ) {
                                // no pairings currently exist and new pairing possible
                                console.log(
                                    `--- pairing ${currentCode} <-> ${newNamePairing}`
                                );
                                this.spcServicesCodePairings[currentCode] =
                                    newNamePairing;
                            } else if (currentNamePairing != undefined) {
                                // existing code pairing found
                                console.log(
                                    `-- ${currentCode} has existing pairing ${currentCode} <-> ${currentNamePairing}`
                                );
                            } else if (newNamePairing == undefined) {
                                // missing code pairing found
                                console.log(
                                    `-- location id ${centreData["LocationId"]} has missing pairing ${currentCode} <-> ${newNamePairing}`
                                );
                                // temporarily pair to undefined for current code list of current centre
                                this.spcServicesCodePairings[currentCode] =
                                    newNamePairing;

                                // add to list of keys to remove after processing this centre's codes
                                keyCodesToRemove.push(currentCode);
                            }
                        }
                    }
                    // code recorded before, start mapping of code to name
                    spcServicesCodeList = spcServicesCodeList.map((item) =>
                        item === spcServiceCode
                            ? this.spcServicesCodePairings[spcServiceCode]
                            : item
                    );

                    // filter out any undefined mappings
                    spcServicesCodeList = spcServicesCodeList.filter(
                        (item) => item != undefined
                    );
                }

                // remove all codes paired to undefined
                for (let keyCodeToRemove of keyCodesToRemove) {
                    delete this.spcServicesCodePairings[keyCodeToRemove];
                }

                this.existingDictData[key]["SpcServices"] = spcServicesCodeList;
            }
        }
        await this.writeDataToFile();
    }
}

module.exports = JsonWriter; // export class
