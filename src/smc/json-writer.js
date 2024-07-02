const fs = require("fs").promises;
const httpRequest = require("./http-request");

// path to JSON file
const jsonFilePath = "data.json";
const codeFilePath = "codes.json";

class JsonWriterSMC {
    // temporary dict of all stored data; to improve runtime complexity
    static existingDictData = {};
    // list of unique codes
    static codes = [];

    static async jsonWriterWriteCodes(codeStringList) {
        try {
            for (code in codeStringList) {
                if (code in codes) {
                    // code already exists, do not add
                    continue;
                }

                this.codes.push(code);
            }

            // convert the data to a JSON string
            // `null, 2` for pretty-printing
            let jsonString = JSON.stringify(this.codes, null, 2);

            await fs.writeFile(codeFilePath, jsonString, "utf8");
            console.log("code JSON file written to successfully");
        } catch (error) {
            console.error("Error writing to JSON file: ", err);
            return;
        }
    }

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
}

module.exports = JsonWriterSMC; // export class
