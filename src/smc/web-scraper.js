// main entry point for selenium webdriver web scraper
require("dotenv").config({ path: "./.env" });
require("chromedriver"); // add chrome driver to PATH
const fs = require("fs");
const cheerio = require("cheerio");
const chrome = require("selenium-webdriver/chrome");
const randomUseragent = require("random-useragent");
const { Builder, By, Key, until } = require("selenium-webdriver");
const JsonWriter = require("./json-writer");
const HtmlHandler = require("./html-handler");
const HttpRequest = require("./http-request");

// environment variables
const WEBSITE_URL = process.env.SMC_WEBSITE_URL;

const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

// regex
// optional country code, optional area code, 7-8 digit phone number (optional middle separation)
const phoneRegex =
    /(\+?\d{1,2}[\s.-]?)?(\(?\d{3}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4}/;
const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;

const timeoutDuration = 10000; // 10 seconds
const captchaWaitDuration = 3000;
const captchaPuzzleWaitDuration = 600000; // 10 mins
const codePattern = /\([A-Za-z0-9]{7}\)/g;

// storage for all unique ids
let codes = [];

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function humanLikeMouseMovement(driver, element) {
    // simulate human-like mouse movement
    const actions = driver.actions({ async: true });
    const startX = Math.floor(Math.random() * 100);
    const startY = Math.floor(Math.random() * 100);
    await actions.move({ x: startX, y: startY }).perform();
    await sleep(200 + Math.random() * 300);
    await actions.move({ origin: element }).perform();
}

(async function main() {
    // setup Chrome WebDriver
    console.log("- creating driver");

    // set up selenium chrome options; simulates real user
    let options = new chrome.Options();
    options.addArguments("--start-maximized");
    // options.addArguments("--user-agent=" + randomUseragent.getRandom());
    options.addArguments(`--user-agent=${USER_AGENT}`);
    options.addArguments("--window-size=1920,1080");
    options.addArguments("--lang=en-US");
    options.addArguments("--disable-blink-features=AutomationControlled"); // hide Selenium
    options.addArguments("--disable-infobars");
    options.addArguments("--disable-notifications");
    options.addArguments("--timezone=Asia/Singapore");

    let driver = await new Builder()
        .forBrowser("chrome")
        .setChromeOptions(options)
        .build();

    // set navigator.webdriver to false; hide webdriver navigator
    await driver.executeScript(
        'Object.defineProperty(navigator, "webdriver", {get: () => undefined})'
    );

    // // Set geolocation to Singapore
    // await driver.executeCdpCommand("Emulation.setGeolocationOverride", {
    //     latitude: 1.3521,
    //     longitude: 103.8198,
    //     accuracy: 100,
    // });

    // check if the cookies file exists
    if (fs.existsSync("cookies.json")) {
        // Load cookies
        let cookies = JSON.parse(fs.readFileSync("cookies.json", "utf8"));
        for (let cookie of cookies) {
            await driver.manage().addCookie(cookie);
        }

        // refresh to use cookies
        await driver.navigate().refresh();
    } else {
        console.log(
            "- cookies file does not exist, continuing without cookies"
        );
    }

    try {
        // navigate to the main directory page
        console.log(`- getting driver url: ${WEBSITE_URL}`);
        await driver.get(WEBSITE_URL);

        console.log("- loading page");

        // find iframe and switch to it
        let mainIFrame = await driver.wait(
            until.elementLocated(By.name("msg_main")),
            timeoutDuration
        );
        await driver.switchTo().frame(mainIFrame);

        let pageNum = 1;
        while (true) {
            console.log(`SEARCHING PAGE: ${pageNum}`);

            // simulate some human-like activity before interacting with the page
            let sleepDuration = 20000 + Math.random() * 5000;
            await sleep(sleepDuration);
            console.log(`-- sleeping for ${sleepDuration} ms`);

            // check for captcha
            let isInCaptchaIFrame = false;
            try {
                let captchaIFrame = await driver.wait(
                    until.elementLocated(By.css('[title="reCAPTCHA"]')),
                    captchaWaitDuration
                );
                console.log("-- captcha found");

                // switch to captcha iframe
                await driver.switchTo().frame(captchaIFrame);
                isInCaptchaIFrame = true;
                console.log("-- switched to captcha iframe");

                let captchaCheckbox = await driver.wait(
                    until.elementLocated(
                        By.css(".rc-anchor-content"),
                        captchaWaitDuration
                    )
                );
                console.log("-- captcha checkbox found");

                // simulate human mouse movement in the captcha
                await humanLikeMouseMovement(driver, captchaCheckbox);
                console.log("-- execute random mouse movement");

                await captchaCheckbox.click();
                console.log("-- captcha checkbox found and clicked");

                // simulate some human-like activity before interacting with the page
                let sleepDuration = 1000 + Math.random() * 1000;
                await sleep(sleepDuration);
                console.log(`-- sleeping for ${sleepDuration} ms`);

                // switch back to parent iframe
                await driver.switchTo().parentFrame();
                isInCaptchaIFrame = false;

                // check for image select captcha
                // Check if the reCAPTCHA puzzle iframe appears
                let puzzleIframe;
                try {
                    puzzleIframe = await driver.wait(
                        until.elementLocated(
                            By.css(
                                'iframe[src*="https://www.google.com/recaptcha/api2/bframe"]'
                            )
                        ),
                        timeoutDuration
                    );
                    console.log(
                        "-- reCAPTCHA puzzle detected, waiting for user to solve it..."
                    );
                } catch (error) {
                    console.log("-- reCAPTCHA puzzle not detected");
                }

                // if puzzle iframe is detected, wait for it to complete
                if (puzzleIframe) {
                    // switch to captcha iframe
                    await driver.switchTo().frame(captchaIFrame);
                    isInCaptchaIFrame = true;
                    console.log("-- switched to captcha iframe");

                    // check for checkbox checkmark
                    await driver.wait(
                        until.elementLocated(
                            By.css(".recaptcha-checkbox-checked")
                        ),
                        captchaPuzzleWaitDuration
                    );
                    console.log("-- reCAPTCHA puzzle solved");
                }
            } catch (error) {
                console.log("-- no captcha found and/or clicked");
            } finally {
                // ensure navigation is not stuck in captcha iframe
                if (isInCaptchaIFrame) {
                    // switch back to parent iframe
                    await driver.switchTo().parentFrame();
                    isInCaptchaIFrame = false;
                }
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
                console.log("-- t&c checkbox found and clicked");

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

            // for each code, obtain HTML page and grab info
            for (let code of codes) {
                let htmlData = HttpRequest.fetchDoctorHtmlData((code = code));
                let textArray = HtmlHandler.extractDataSMC((html = htmlData));
                let newDict = {};

                // input into new dictionary
                newDict["name"] = textArray[0];
                newDict["code"] = textArray[2];
                newDict["qualifications"] = textArray[3];
                newDict["provisional-registion"] = textArray[4];
                newDict["current-registration"] = textArray[5];
                newDict["cert-start"] = textArray[6];
                newDict["cert-end"] = textArray[7];
                newDict["reg-spec-date"] = textArray[8];
                newDict["reg-family-phy-date"] = textArray[9];
                newDict["practice-place"] = textArray[10];
                newDict["address"] = textArray[11];
                newDict["telephone"] = textArray[12];

                let dictToAdd = {};
                dictToAdd[code] = newDict;
                JsonWriter.jsonWriterAdd(dictToAdd);
            }

            // TODO: remove temp code
            JsonWriter.writeDataToFile();

            // navigate to next page
            try {
                console.log("- navigating to next page");
                let nextButton = await driver.findElement(By.linkText("Next"));
                await nextButton.click();
                pageNum++;
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
        // Save cookies
        let cookies = await driver.manage().getCookies();
        fs.writeFileSync("cookies.json", JSON.stringify(cookies, null, 2));

        // quit the driver
        // await driver.quit();
    }
})();
