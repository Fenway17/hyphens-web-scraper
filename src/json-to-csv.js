const fs = require("fs").promises;
const { Parser } = require("json2csv");

class JsonToCsv {
    static async convertJsonToCsv(jsonFilePath, csvFilePath) {
        try {
            // Read the JSON file
            const jsonData = await fs.readFile(jsonFilePath, "utf8");
            const jsonParsed = JSON.parse(jsonData);

            // Convert JSON to CSV
            const parser = new Parser();
            const csv = parser.parse(jsonParsed);

            // Write the CSV to a file
            await fs.writeFile(csvFilePath, csv);

            console.log("CSV file has been created successfully");
        } catch (error) {
            console.error("Error converting JSON to CSV:", error);
        }
    }
}

module.exports = JsonToCsv; // export class
