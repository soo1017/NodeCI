//const puppeteer = require('puppeteer');  // because page.js (proxy) embraces puppeteer
// const sessionFactory = require('./factories/sessionFactory');
// const userFactory = require('./factories/userFactory');
const Page = require('./helpers/page');

// test('Adds two numbers', () => {
//   const sum = 1 + 2;
//
//   expect(sum).toEqual(3);
// });

let page;
// let browser, page;

beforeEach(async () => {
  // browser = await puppeteer.launch({
  //   headless: false
  // });      // async operation
  // page = await browser.newPage();
  page = await Page.build();      // page is proxy governing customPage, puppeteer page and browser
  await page.goto('http://localhost:3000');
  // await page.goto('localhost:3000');
});

afterEach(async () => {
  await page.close();
  // await browser.close();
})

test('The header has the correct text', async () => {
  const text = await page.getContentsOf('a.brand-logo');
  // const text = await page.$eval('a.brand-logo', el => el.innerHTML);    // function $eval() is weird

  expect(text).toEqual('Blogster');
});

test('clicking login starts oauth flow', async () => {
  await page.click('.right a');

  const url = await page.url();

  console.log(url);
  expect(url).toMatch(/accounts\.google\.com/);
});

test('When signed in, show logout button', async () => {
// test.only('When signed in, show logout button', async () => {
  // const id = '5ac6745f2d8e42452adaba55';

  // const user = await userFactory();
  // const { session, sig } = sessionFactory(user);
  //
  // console.log(session, sig);
  //
  // await page.setCookie({ name: 'session', value: session });
  // await page.setCookie({ name: 'session.sig', value: sig });
  // await page.goto('localhost:3000');              // refresh
  // await page.waitFor('a[href="/auth/logout"]');
  await page.login();

  // const text = await page.getContentsOf('a[href="/auth/logout"]');
  const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML);

  expect(text).toEqual('Logout');
});
