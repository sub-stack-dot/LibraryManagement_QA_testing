require('chromedriver');


const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('chai');

describe('Library Webpage Test', function() {
  this.timeout(20000); // increase timeout for browser actions
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async () => {
    await driver.quit();
  });

  it('should add a book using the form', async () => {
    // Go to localhost
    await driver.get('http://localhost:3000');

    // Wait until the form is loaded
    await driver.wait(until.elementLocated(By.id('addForm')), 5000);

    // Fill in the title
    const titleInput = await driver.findElement(By.id('title'));
    await titleInput.sendKeys('Test Book');

    // Fill in the author
    const authorInput = await driver.findElement(By.id('author'));
    await authorInput.sendKeys('John Doe');

    // Click "Add Book"
    const addButton = await driver.findElement(By.css('#addForm button[type="submit"]'));
    await addButton.click();

    // Wait for the book to appear in the list
    await driver.wait(async () => {
      const books = await driver.findElements(By.css('#books li'));
      return books.length > 0;
    }, 5000);

    // Verify the book was added
    const books = await driver.findElements(By.css('#books li'));
    const bookTexts = await Promise.all(books.map(b => b.getText()));
    expect(bookTexts.some(text => text.includes('Test Book by John Doe'))).to.be.true;
  });
});
