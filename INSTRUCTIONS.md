# HOW TO RUN HEALTHHUB API REQUEST SCRIPT

-   Use `npm run start-api-request` to run the HTTP-API-request script

-   Approximately < 5 mins of total runtime needed

## POSSIBLE REQUIRED CHANGES

-   `.env` contains paramaters that are used in the HTTP request to contact the website
    API to obtain HTTP response packets containing required information; this prevents
    exposure of website and HTTP request details that may be considered more sensitive information.

-   Should the HTTP request headers change due to some update on the website, the paramaters of
    the HTTP request used in the script will also need to be updated.

## HOW TO DEBUG HEALTHHUB API REQUEST SCRIPT

-   HTTP request headers' information can be found on the website itself, through browser
    inspection tools. With inspection open, refresh the webpage showing the list of clients.

-   This causes a new HTTP request to be sent to obtain the list of client information. This
    will be shown in browser inspection under `network`. Use the HTTP header information shown
    to update the variables in `.env` or `http-request.js`

# USAGE OF SELENIUM WEBDRIVER SCRAPER SCRIPT

-   Use `npm run start` to run the HTTP-API-request script

-   Currently not complete. It can scrape one page of the client list, and requires further
    coding to include functionality to navigate the buttons at the bottom of the list on the
    webpage.

-   Refer to `TODO` comments on which parts need extension.

-   DISCLAIMER: using this method results in 3-5 seconds of runtime per entry to scrape, and
    alongside 15000+ entries total, would result in about 12 hours of runtime at worst time
    complexity.

# USAGE OF SMC API REQUEST SCRIPT

-   DISCLAIMER: Requires user to obtain a valid cookie
-   Visit `www.healthprofessionals.gov.sg/smc` and navigate to "Search for registered doctors"
    -   Alternatively `https://prs.moh.gov.sg/prs/internet/profSearch/main.action?hpe=SMC`
-   Open network inspection tools
-   Accept terms of conditions and search for "All" registered doctors and click "Search"
    -   This creates a usable cookie that be found in the browser's network
-   Go to `https://prs.moh.gov.sg/prs/internet/profSearch/getSearchSummaryByName.action#`
    -   Under the browser's network tab, find the HTTP packet used to get the HTML information
    -   Copy and paste the HTTP request's "Cookie" into `.env`
