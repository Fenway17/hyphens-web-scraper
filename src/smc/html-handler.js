const fs = require("fs");
const cheerio = require("cheerio");

// path to local HTML file
const htmlFilePath = "./example-smc.html";

// load local HTML file
function loadLocalHtml(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

// grab required text data from SMC HTML data
// filePath for local HTML file, and html for raw html data
async function extractDataSMC(filePath = null, html = null) {
    let results = [];

    if (filePath == null && html == null) {
        // no parameters
        console.warn("called extractDataSMC with no paramaneters");
        return results;
    }

    if (filePath != null && html != null) {
        // both parameters provided
        console.warn("called extractDataSMC with conflicting paramaneters");
        return results;
    }

    try {
        let htmlData;
        if (filePath != null) {
            // load HTML content
            htmlData = await loadLocalHtml(filePath);
        }

        if (html != null) {
            htmlData = html;
        }

        // parse HTML content
        const $ = cheerio.load(htmlData);

        // find the profDetails element
        const profDetails = $("#profDetails");

        if (!profDetails.length) {
            console.log("No element with id profDetails found.");
            return;
        }

        // find elements with class no-border table-data within profDetails
        const tableDataElements = profDetails.find(".no-border.table-data");

        if (!tableDataElements.length) {
            console.log("No elements with class no-border table-data found.");
            return;
        }

        // extract and print text from each table-data element
        tableDataElements.each((index, element) => {
            let text = $(element).text().trim();
            // replace multiple whitespaces with a single space
            text = text.replace(/\s+/g, " ");
            console.log(`Text from element ${index + 1}: ${text}`);
            results.push(text);
        });

        return results;
    } catch (error) {
        console.error("Error:", error);
    }
}

// Call the extractDataSMCs function
extractDataSMC((filePath = htmlFilePath));

module.exports = {
    extractDataSMC,
};
