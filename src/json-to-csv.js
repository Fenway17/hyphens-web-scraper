const fs = require("fs").promises;
const { Parser } = require("json2csv");

class JsonToCsv {
    static async writeJsonToCsv(jsonFilePath, csvFilePath) {
        try {
            // read the JSON file and parse to JavaScript object
            const jsonData = await fs.readFile(jsonFilePath, "utf8");
            const jsonParsed = JSON.parse(jsonData);

            // convert JSON object to CSV string
            const parser = new Parser();
            const csv = parser.parse(jsonParsed);

            // write the CSV to a file
            await fs.writeFile(csvFilePath, csv);

            console.log("CSV file has been created successfully");
        } catch (error) {
            console.error("Error converting JSON to CSV:", error);
        }
    }

    static async writeJsonObjectToCsv(jsonObject, csvFilePath) {
        try {
            // convert JSON object to CSV string
            const parser = new Parser();
            const csv = parser.parse(jsonObject);

            // write the CSV to a file
            await fs.writeFile(csvFilePath, csv);

            console.log("CSV file has been created successfully");
        } catch (error) {
            console.error("Error converting JSON to CSV:", error);
        }
    }
}

module.exports = JsonToCsv; // export class
