# hyphens-scraper

Web scraper to collect required information from websites
Author: Tan Yong Rui

## HH Scraper

### Important Disclaimer

-   Currently uses the API request method to collect information instead
    -   Utilizing HTTP requests is very fast
    -   Relies on the HTTP request logic of the website to remain the same
    -   < 5 mins of runtime
-   Web scraper script using Selenium is **not complete** and only scrapes one page of results
    -   Using Selenium WebDriver is too slow due to needing to wait for dynamic JavaScript
        elements to load
    -   Relies on the HTML of the website remaining the same
    -   Possibly up to 10 hours of runtime if fully implemented

### Running The Script

-   `npm run start-web-scraper-hh` to run the Selenium web scraper script
    -   Currently may not work as intended
-   `npm run start-api-request-hh` to run the API request scraper script
    -   Mainly **use this**
-   Results are saved to `data.csv` and `data.json`
-   Refer to `INSTRUCTIONS.md` for details on degbugging and logic

## SMC Scraper

### Important Disclaimer

-   The website uses reCAPTCHA, preventing full automation in the current implementation
    -   Requires periodic user input to solve CAPTCHA challenges manually

### Running The Script

-   `npm run start-web-scraper-smc` to run the Selenium web scraper script
    -   Mainly **use this**
-   `npm run start-api-request-smc` to run the API request scraper script
    -   Currently may not work as intended
-   Results are saved to `smc-data.json`
-   Refer to `INSTRUCTIONS.md` for details on degbugging and logic
