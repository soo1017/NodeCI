const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({
      headless: true,                // in virtual machine
      args: ['--no-sandbox']        // reduce amount of run time
      // headless: false
    });

    const page = await browser.newPage();
    const customPage = new CustomPage(page);
    // const customPage = new CustomPage(page, browser);

    return new Proxy(customPage, {
      get: function(target, property) {
        return customPage[property] || browser[property] || page[property];
        // return customPage[property] || page[property] || browser[property];    // page has close() function, it runs first and then not coming to browser close function anymore
      }
    });
  }

  constructor(page) {
  // constructor(page, browser) {
    this.page = page;
    // this.browser = browser;
  }

  // customPage now has close() function here, not need to come to page's close function
  // close() {
  //   this.browser.close();
  // }

  async login() {
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);

    console.log(session, sig);

    // await page.setCookie({ name: 'session', value: session });
    // await page.setCookie({ name: 'session.sig', value: sig });
    // await page.goto('localhost:3000');              // refresh
    // await page.waitFor('a[href="/auth/logout"]');
    await this.page.setCookie({ name: 'session', value: session });
    await this.page.setCookie({ name: 'session.sig', value: sig });
    await this.page.goto('http://localhost:3000/blogs');              // refresh
    // await this.page.goto('localhost:3000/blogs');              // refresh
    // await this.page.goto('localhost:3000');              // refresh
    await this.page.waitFor('a[href="/auth/logout"]');
  }

  async getContentsOf(selector) {
    return this.page.$eval(selector, el => el.innerHTML);
  }
}

module.exports = CustomPage;
