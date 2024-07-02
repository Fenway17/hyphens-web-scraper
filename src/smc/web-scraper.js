// main entry point for selenium webdriver web scraper
require("dotenv").config({ path: "./.env" });
require("chromedriver"); // add chrome driver to PATH
const { Builder, By, Key, until } = require("selenium-webdriver");
const JsonWriter = require("./json-writer");

// environment variables
const WEBSITE_URL = process.env.SMC_WEBSITE_URL;

// regex
// optional country code, optional area code, 7-8 digit phone number (optional middle separation)
const phoneRegex =
    /(\+?\d{1,2}[\s.-]?)?(\(?\d{3}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4}/;
const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;

// CSS associated with the required information
const NAME_LIST_CSS = "div.font15px";

// class info used in the HTML of required information
const CLINIC_GENERAL_INFO_CLASS = "flex flex-col md:flex md:w-full";

const timeoutDuration = 10000; // 10 seconds
const captchaWaitDuration = 1000; // 1 second
const codePattern = /\([A-Za-z0-9]{7}\)/g;

// storage for all unique ids
let codes = [];

(async function main() {
    // setup Chrome WebDriver
    console.log("- creating driver");
    let driver = await new Builder().forBrowser("chrome").build();

    try {
        // navigate to the main directory page
        console.log(`- getting driver url: ${WEBSITE_URL}`);
        await driver.get(WEBSITE_URL);

        console.log("- loading page");

        // find iframe and switch to it
        let iframe = await driver.wait(
            until.elementLocated(By.name("msg_main")),
            timeoutDuration
        );
        await driver.switchTo().frame(iframe);

        while (true) {
            // check for captcha
            try {
                let checkbox = await driver.wait(
                    until.elementLocated(By.id("recaptcha-anchor")),
                    captchaWaitDuration
                );
                await checkbox.click();
                console.log("-- captcha checkbox found and clicked");
            } catch (error) {
                console.log("-- no captcha checkbox found or clicked");
            }

            // check for and accept terms and conditions
            // click search to start searching
            try {
                // find and click t&c checkbox
                let checkbox = await driver.findElement(
                    By.id("istermConditions")
                );
                let isSelected = await checkbox.isSelected();
                if (!isSelected) {
                    await checkbox.click();
                }

                // click search button
                let searchButton = await driver.wait(
                    until.elementLocated(By.name("search")),
                    timeoutDuration
                );
                await searchButton.click();
            } catch (error) {
                console.log("-- no t&c checkbox found or clicked");
            }

            // get all elements of the results list
            console.log("- getting list elements");
            let elements = await driver.wait(
                until.elementsLocated(By.css("div.font15px")),
                timeoutDuration
            );
            // extract the text content of those elements
            let textContents = await Promise.all(
                elements.map(async (element) => {
                    return await element.getText();
                })
            );
            // extract codes from the text contents
            textContents.forEach((text) => {
                let matches = text.match(codePattern);
                console.log(matches);
                if (matches) {
                    codes.push(...matches);
                }
            });

            // navigate to next page
            try {
                console.log("- navigating to next page");
                let nextButton = await driver.findElement(By.linkText("Next"));
                await nextButton.click();
                console.log("- clicked the Next button");
            } catch (error) {
                // possibly reached the last page, exit loop
                console.log("- no Next button found");
                break;
            }
        }

        // write codes to a json file
        console.log("- writing codes to JSON file");
        console.log(codes);
        JsonWriter.jsonWriterWriteCodes(codes);
    } finally {
        // quit the driver
        // await driver.quit();
    }
})();
