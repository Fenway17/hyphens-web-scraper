# healthhub-scraper

Web scraper to collect required information from websites

## Important Disclaimer

-   Currently uses the API request method to collect information instead
    -   Utilizing HTTP requests is very fast
    -   Relies on the HTTP request logic of the website to remain the same
    -   < 5 mins of runtime
-   Web scraper script using Selenium is not complete and only scrapes one page of results
    -   Using Selenium WebDriver is too slow due to needing to wait for dynamic JavaScript
        elements to load
    -   Relies on the HTML of the website remaining the same
    -   Possibly up to 10 hours of runtime if fully implemented

## Running The Script

-   `npm run start` to run the Selenium web scraper script
-   `npm run start-api-request` to run the API request scraper script

-   Results are saved to `data.csv` and `data.json`
-   Refer to `INSTRUCTIONS.md` for details on degbugging and logic
