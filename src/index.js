// Main entry point
require("dotenv").config({ path: "./.env" });
const WEBSITE_URL = process.env.WEBSITE_URL;
require("chromedriver"); // add chrome driver to PATH
const { Builder, By, Key, until } = require("selenium-webdriver");

// CSS associated to the required information
const CLINIC_LIST_CSS =
    ".flex.w-full.flex-col.gap-4.px-8 > .mx-6.flex.flex-row.gap-4";
const CLINIC_LIST_ELEMENT_CSS = ".flex.w-full.flex-col.gap-4.px-8 > div";
const CLINIC_NAME_CSS =
    ".flex.justify-center.text-2xl.font-semibold.tracking-tight.md:ml-16.md:justify-start";
const CLINIC_LOCATION_CSS = ".text-2xl.font-semibold.tracking-tighter";
const CLINIC_INFO_BOX_CSS = "flex w-full flex-col items-start md:flex-row";
// class info used in the HTML of required information
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

        // wait for the page to load and display the results
        console.log("- loading page");
        // wait for search results to load
        await driver.wait(
            until.elementsLocated(By.css(CLINIC_LIST_CSS)),
            10000
        );

        // Get all elements of the table
        console.log("- getting table elements");
        // let links = await driver.findElements(By.css('.list-group-item a'));
        let tableElements = await driver.findElements(
            By.css(CLINIC_LIST_ELEMENT_CSS)
        );

        console.log(`- table_elements= ${tableElements.length} elements`);
        for (let tableElement of tableElements) {
            console.log("- finding link");
            let link = await tableElement.findElement(By.css("div a"));
            console.log("- extracting link");
            let href = await link.getAttribute("href");
            console.log(`- Visiting: ${href}`);

            // visit each element's page
            await driver.get(href);

            // extract information such as name, location, and operating days
            let name = await driver
                .findElement(By.css(CLINIC_NAME_CSS))
                .getText();
            console.log(`- name: ${name}`);
            let location = await driver
                .findElement(By.css(CLINIC_LOCATION_CSS))
                .getText();
            console.log(`- location: ${location}`);
            // info box contains HCI code, operation days/hours, phone number, and specified services
            let HCICode;
            let operationalHours = {}; // dict of days->hours
            let phoneNumber;
            let email;
            let specializedServices = []; // list of services
            let infoBox = await driver.findElement(By.css(CLINIC_INFO_BOX_CSS));
            let infoBoxElements = await infoBox.findElements(By.css("div"));
            for (let infoElement of infoBoxElements) {
                let classString = infoElement.getAttribute("class");
                if (classString == CLINIC_GENERAL_INFO_CLASS) {
                    // part of the general info
                    // find children with text (not just whitespaces)
                    let childDivs = await infoElement.findElements(
                        By.xpath('.//div[normalize-space(text()) != ""]')
                    );
                    let childSpans = await infoElement.findElements(
                        By.xpath('.//span[normalize-space(text()) != ""]')
                    );
                } else if (classString == CLINIC_SERVICES_CLASS) {
                    // part of the specialized services
                }
            }

            // let operatingDays = await driver
            //     .findElement(By.css(".operating-days"))
            //     .getText();

            // console.log(`Name: ${name}`);
            // console.log(`Location: ${location}`);
            // console.log(`Operating Days: ${operatingDays}`);

            // navigate back to the directory page
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
