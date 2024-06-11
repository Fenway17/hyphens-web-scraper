const fs = require("fs");
// Path to your JSON file
const jsonFilePath = "data.json";

class JsonWriter {
    static jsonWrite(dictStringToAdd) {
        // Check if the JSON file exists
        fs.access(jsonFilePath, fs.constants.F_OK, (err) => {
            if (err) {
                // File does not exist, create a new one and write the JSON string to it
                JsonWriter.writeDataToFile(dictStringToAdd);
            } else {
                // File exists, read its content
                fs.readFile(jsonFilePath, "utf8", (err, data) => {
                    if (err) {
                        console.error("Error reading JSON file: ", err);
                        return;
                    }

                    // Parse the existing JSON content
                    let existingDictData = JSON.parse(data);

                    if (dictStringToAdd[0] in existingDictData) {
                        console.log(
                            `- HCICode: ${dictStringToAdd[0]} already exists.`
                        );
                        return; // do not continue to store data
                    }

                    // Combine the data objects
                    let combinedDictData = {
                        ...existingDictData,
                        ...dictStringToAdd,
                    };
                    JsonWriter.writeDataToFile(combinedDictData);
                });
            }
        });
    }

    // Function to write data to the file
    static writeDataToFile(data) {
        // Convert the data to a JSON string
        // `null, 2` for pretty-printing
        let jsonString = JSON.stringify(data, null, 2);

        // Write the JSON string back to the file
        fs.writeFile(jsonFilePath, jsonString, "utf8", (err) => {
            if (err) {
                console.error("Error writing to JSON file:", err);
            } else {
                console.log("Data added to JSON file successfully.");
            }
        });
    }
}

module.exports = JsonWriter; // export class
