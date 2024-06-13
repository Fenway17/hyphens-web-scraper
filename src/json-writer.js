const fs = require("fs").promises;
// Path to your JSON file
const jsonFilePath = "data.json";

class JsonWriter {
    static async jsonWrite(dictStringToAdd) {
        try {
            let existingDictData;

            try {
                const fileData = await fs.readFile(jsonFilePath, "utf8");
                // Parse the existing JSON content into JavaScript object
                existingDictData = JSON.parse(fileData);
            } catch (error) {
                // Ignore error if file does not exist
                if (error.code !== "ENOENT") {
                    throw error;
                }
            }

            let finalDictData = dictStringToAdd;
            if (existingDictData != undefined) {
                if (dictStringToAdd[0] in existingDictData) {
                    console.log(
                        `- HCICode: ${dictStringToAdd[0]} already exists.`
                    );
                    return; // do not continue to store data
                }

                // Combine the data objects
                finalDictData = {
                    ...existingDictData,
                    ...dictStringToAdd,
                };
            }
            await JsonWriter.writeDataToFile(finalDictData);
        } catch (error) {
            console.error("Error writing to JSON file: ", err);
            return;
        }
    }

    // Function to write data to the file
    static async writeDataToFile(data) {
        // Convert the data to a JSON string
        // `null, 2` for pretty-printing
        let jsonString = JSON.stringify(data, null, 2);

        // Write the JSON string back to the file
        await fs.writeFile(jsonFilePath, jsonString, "utf8", (err) => {
            if (err) {
                console.error("Error writing to JSON file:", err);
            } else {
                console.log("Data added to JSON file successfully.");
            }
        });
    }
}

module.exports = JsonWriter; // export class
