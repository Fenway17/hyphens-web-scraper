# HOW TO RUN API REQUEST SCRIPT

-   Use `npm run start-api-request` to run the HTTP-API-request script

# POSSIBLE REQUIRED CHANGES

`.env` contains paramaters that are used in the HTTP request to contact the website
API to obtain HTTP response packets containing required information.

Should the HTTP request headers change due to some update on the website, the paramaters of
the HTTP request used in the script will also need to be updated.

# HOW TO DEBUG API REQUEST SCRIPT

HTTP request headers' information can be found on the website itself, through browser
inspection tools. With inspection open, refresh the webpage showing the list of clients.

This causes a new HTTP request to be sent to obtain the list of client information. This
will be shown in browser inspection under `network`. Use the HTTP header information shown
to update the variables in `.env` or `http-request.js`

# USAGE OF SELENIUM WEBDRIVER SCRAPER SCRIPT

Currently only half-done. It can scrape one page of the client list, and requires further
coding to include functionality to navigate the buttons at the bottom of the list on the
webpage.
