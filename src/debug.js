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
