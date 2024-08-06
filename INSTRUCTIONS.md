# HOW TO RUN HEALTHHUB API REQUEST SCRIPT

-   Use `npm run start-api-request-hh` to run the HTTP-API-request script

-   Approximately < 5 mins of total runtime needed

## POSSIBLE REQUIRED CHANGES

-   `.env` contains paramaters that are used in the HTTP request to contact the website
    API to obtain HTTP response packets containing required information; this prevents
    exposure of website and HTTP request details that may be considered sensitive information.

-   Should the HTTP request headers change due to some update on the website, the paramaters of
    the HTTP request used in the script will also need to be updated.

## HOW TO DEBUG HEALTHHUB API REQUEST SCRIPT

-   HTTP request headers' information can be found on the website itself, through browser
    inspection tools (F12 or right click). With inspection open, refresh the webpage
    showing the list of clients.

-   This causes a new HTTP request to be sent to obtain the list of client information. This
    will be shown in browser inspection under `network`. Use the HTTP header information shown
    to update the variables in `.env` or `http-request.js`

# USAGE OF HH SELENIUM WEBDRIVER SCRAPER SCRIPT

-   Use `npm run start-web-scraper-hh` to run the HTTP-API-request script

-   Currently **not complete**. It can scrape one page of the client list, and requires further
    coding to include functionality to navigate the buttons at the bottom of the list on the
    webpage.

-   Refer to `TODO` comments on which parts need extension.

-   **DISCLAIMER:** using this method results in 3-5 seconds of runtime per entry to scrape, and
    alongside 15000+ entries total, would result in about 12 hours of runtime at worst time
    complexity.

# USAGE OF SMC SELENIUM WEBDRIVER SCRAPER SCRIPT

-   `npm run start-web-scraper-smc` to run the Selenium web scraper script
-   Delete `cookies.json` if script does not run properly (reset cookies)

## HOW TO DEBUG SMC API REQUEST SCRIPT

-   HTTP request headers' information can be found on the website itself, through browser
    inspection tools (F12 or right click). With inspection open, refresh the webpage
    showing the list of clients.

-   This causes a new HTTP request to be sent to obtain the list of client information. This
    will be shown in browser inspection under `network`. Use the HTTP header information shown
    to update the variables in `.env` or `http-request.js`
