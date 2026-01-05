const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

let driver;

before(async function () {
  this.timeout(60000);

  const options = new chrome.Options();

  options.addArguments('start-maximized');
 
  driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
  
  await driver.manage().window().maximize();
});

after(async function () {
  if (driver) {
    await driver.quit();
  }
});

beforeEach(async function () {
  await driver.manage().setTimeouts({
    implicit: 5000,
    pageLoad: 30000,
    script: 30000,
  });
});

function getDriver() {
  if (!driver) throw new Error('Driver nije inicijaliziran');
  return driver;
}

module.exports = { getDriver, assert };
