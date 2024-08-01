// main entry point for selenium webdriver web scraper
require("dotenv").config({ path: "./.env" });
require("chromedriver"); // add chrome driver to PATH
const { Builder, By, Key, until } = require("selenium-webdriver");
const JsonWriter = require("../json-writer");

// environment variables
const WEBSITE_URL = process.env.HH_WEBSITE_URL;

// regex
// optional country code, optional area code, 7-8 digit phone number (optional middle separation)
const phoneRegex =
    /(\+?\d{1,2}[\s.-]?)?(\(?\d{3}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4}/;
const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;

// CSS associated with the required information
const CLINIC_LIST_CSS =
    ".flex.w-full.flex-col.gap-4.px-8 > .mx-6.flex.flex-row.gap-4";
const CLINIC_LIST_ELEMENT_CSS = ".flex.w-full.flex-col.gap-4.px-8 > div";
const CLINIC_NAME_CSS =
    ".flex.justify-center.text-2xl.font-semibold.tracking-tight";
const CLINIC_LOCATION_CSS = ".text-2xl.font-semibold.tracking-tighter";
const CLINIC_INFO_BOX_CSS = ".flex.w-full.flex-col.items-start";

// class info used in the HTML of required information
const CLINIC_LIST_PAGE_BUTTON_CLASS = "mt-4 flex justify-center";
const CLINIC_GENERAL_INFO_CLASS = "flex flex-col md:flex md:w-full";
const CLINIC_SERVICES_CLASS =
    "flex flex-col items-start gap-2 py-5 text-base tracking-tighter md:ml-16 md:w-[40%] md:py-0";

(async function main() {
    // setup Chrome WebDriver
    console.log("- creating driver");
    let driver = await new Builder().forBrowser("chrome").build();

    try {
        // navigate to the main directory page
        console.log(`- getting driver url: ${WEBSITE_URL}`);
        await driver.get(WEBSITE_URL);

        console.log("- loading page");
        // wait for search results to load
        await driver.wait(
            until.elementsLocated(By.css(CLINIC_LIST_CSS)),
            10000
        );

        // get all elements of the results table
        console.log("- getting table elements");
        let tableElements = await driver.findElements(
            By.css(CLINIC_LIST_ELEMENT_CSS)
        );

        console.log(`- table_elements= ${tableElements.length} elements`);
        for (let tableElement of tableElements) {
            let classString = await tableElement.getAttribute("class");
            if (classString == CLINIC_LIST_PAGE_BUTTON_CLASS) {
                // reached the bottom buttons
                // TODO: NAVIGATE PAGE BUTTONS
            }

            // search web elements for url link and extract it
            console.log("- finding link");
            let link = await tableElement.findElement(By.css("div a"));
            console.log("- extracting link");
            let href = await link.getAttribute("href");
            console.log(`- Visiting: ${href}`);

            // visit each element's page url
            await driver.get(href);
            console.log(`- visit page success`);

            // wait for page to load main page title/name
            await driver.wait(
                until.elementsLocated(By.css(CLINIC_NAME_CSS)),
                10000
            );

            // extract information such as name, location, and operating days
            let name = await driver
                .findElement(By.css(CLINIC_NAME_CSS))
                .getText();
            console.log(`- name: ${name}`);
            let location; // may not exist
            let locationElements = await driver.findElements(
                By.css(CLINIC_LOCATION_CSS)
            );
            if (locationElements.length > 0) {
                location = await locationElements[0].getText();
                console.log(`- location: ${location}`);
            }

            // info box contains HCI code, operation days/hours, phone number, and specified services
            let HCICode;
            let operationalHours = {}; // dict of days->hours
            let phoneNumber;
            let email;
            let specifiedServices = []; // list of services
            let infoBox = await driver.findElement(By.css(CLINIC_INFO_BOX_CSS));
            console.log("- info box found");
            let infoBoxElements = await infoBox.findElements(
                By.css(":scope > div")
            );
            for (let infoElement of infoBoxElements) {
                let classString = await infoElement.getAttribute("class");
                if (classString == CLINIC_GENERAL_INFO_CLASS) {
                    // part of the general info
                    // find direct children elements
                    let childElements = await infoElement.findElements(
                        By.css(":scope > div")
                    );
                    for (let childElement of childElements) {
                        let text = await childElement.getText();
                        if (text.includes("HCI")) {
                            console.log(`- HCI: ${text}`);
                            // eg. HCI Code (MOSD): 11M1111(L)
                            HCICode = text.split(":")[1].trim();
                        } else if (text.includes("Monday")) {
                            console.log(`- operation hours: ${text}`);
                            // eg. Monday : All Day\n Tuesday : 18:00 to 22:00 Hours
                            let list = text.split("\n");
                            console.log(`- operation list: ${list}`);
                            for (let listElement of list) {
                                let keyValue = listElement.split(" : ");
                                operationalHours[keyValue[0].trim()] =
                                    keyValue[1].trim();
                            }
                        } else if (phoneRegex.test(text)) {
                            console.log(`- phone number: ${text}`);
                            // eg. 61234567(Work)
                            // g flag to make it "global"; grab all digit strings
                            digits = text.match(/\d+/g);
                            console.log(`- digits: ${digits}`);
                            phoneNumber = digits[0];
                        } else if (emailRegex.test(text)) {
                            console.log(`- email: ${text}`);
                            // eg. PlaceholderText@nuhs.edu.sg
                            email = text;
                        }
                    }
                } else if (classString == CLINIC_SERVICES_CLASS) {
                    // part of the specified services
                    let text = await infoElement.getText();
                    console.log(`- specified services: ${text}`);
                    let list = text.split("\n");
                    for (let listElement of list) {
                        // check if element is not the title
                        if (!listElement.includes("Specified Services")) {
                            console.log(`- service element: ${listElement}`);
                            specifiedServices.push(listElement);
                        }
                    }
                }
            }

            if (HCICode !== undefined) {
                // create object to hold the data
                let centreData = {
                    name: name,
                    location: location === undefined ? null : location,
                    HCICode: HCICode === undefined ? null : HCICode,
                    operational_hours: operationalHours,
                    phone_number:
                        phoneNumber === undefined ? null : phoneNumber,
                    email: email === undefined ? null : email,
                    specified_services:
                        specifiedServices.length == 0
                            ? null
                            : specifiedServices,
                };

                let jsonDictData = {};
                jsonDictData[HCICode] = centreData;

                // write dict data to json file
                JsonWriter.jsonWriterAdd(jsonDictData);
                JsonWriter.writeDataToFile();
            }

            // navigate back to the directory page
            console.log("- navigating back");
            await driver.navigate().back();
            await driver.wait(
                until.elementsLocated(By.css(CLINIC_LIST_CSS)),
                10000
            );
        }
    } finally {
        // quit the driver
        await driver.quit();
    }
})();
