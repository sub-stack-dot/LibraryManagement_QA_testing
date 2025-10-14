require('chromedriver');
const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('chai');

describe('Library Add and Borrow Test', function () {
  this.timeout(40000);
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it('should add a book and then borrow it', async () => {
    await driver.get('http://localhost:3000');

    // Wait for form
    await driver.wait(until.elementLocated(By.id('addForm')), 5000);

    // Fill Title and Author
    await driver.findElement(By.id('title')).sendKeys('Test Book Borrow');
    await driver.findElement(By.id('author')).sendKeys('Jane Doe');

    // Click Add Book
    await driver.findElement(By.css('#addForm button[type="submit"]')).click();

    // Wait for the book to appear
    await driver.wait(async () => {
      const books = await driver.findElements(By.css('#books li'));
      for (let b of books) {
        if ((await b.getText()).includes('Test Book Borrow by Jane Doe')) return true;
      }
      return false;
    }, 5000);

    // Always **refetch elements** before interacting
    let borrowButton;
    await driver.wait(async () => {
      const books = await driver.findElements(By.css('#books li'));
      for (let b of books) {
        const text = await b.getText();
        if (text.includes('Test Book Borrow by Jane Doe')) {
          try {
            borrowButton = await b.findElement(By.css('button'));
            return true;
          } catch {
            return false;
          }
        }
      }
      return false;
    }, 5000);

    expect(borrowButton).to.not.be.undefined;

    // Click borrow
    await borrowButton.click();

    // Wait for the book to show as borrowed
    await driver.wait(async () => {
      const books = await driver.findElements(By.css('#books li'));
      for (let b of books) {
        const text = await b.getText();
        if (text.includes('Test Book Borrow by Jane Doe')) {
          return text.includes('(borrowed)');
        }
      }
      return false;
    }, 5000);

    // Verify
    const booksFinal = await driver.findElements(By.css('#books li'));
    const texts = await Promise.all(booksFinal.map(b => b.getText()));
    expect(texts.some(text => text.includes('Test Book Borrow by Jane Doe (borrowed)'))).to.be.true;
  });
});
