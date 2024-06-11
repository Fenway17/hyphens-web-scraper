// Some helper functions / code to aid in using selenium

// FIND ELEMENT
// Scroll to the element
await driver.executeScript("arguments[0].scrollIntoView();", element);
// Highlight the element
await driver.executeScript(
    "arguments[0].style.border='2px solid red'",
    element
);
// Optionally, wait a bit to see the highlight
await driver.sleep(5000);

// // find children with text (not just whitespaces)
// // HCI and operational hours
// let childDivs = await infoElement.findElements(
//     By.xpath('.//div[normalize-space(text()) != ""]')
// );
// // phone number and email
// let childSpans = await infoElement.findElements(
//     By.xpath('.//span[normalize-space(text()) != ""]')
// );
