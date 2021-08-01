// const puppeteer = require("puppeteer");
const instagram = {
  browser: null,
  page: null,

  initialize: async (puppeteer) => {
    instagram.browser = await puppeteer.launch({
      headless: false,
      //   args: [
      //     "--allow-external-pages",
      //     "--allow-third-party-modules",
      //     "--data-reduction-proxy-http-proxies",
      //     "--no-sandbox",
      //   ],
    });
    instagram.page = await instagram.browser.newPage();
    await instagram.page.setViewport({
      width: 800,
      height: 800,
    });
  },

  login: async (username, password) => {
    await instagram.page.goto("https://www.instagram.com/accounts/login/", {
      waitUntil: "networkidle0",
    });
    await instagram.page.waitFor('input[name="username"]');
    await instagram.page.focus('input[name="username"]');
    await instagram.page.keyboard.type(`${username}`);
    await instagram.page.focus('input[name="password"]');
    await instagram.page.keyboard.type(`${password}`);
    await Promise.all([
      await instagram.page.click('button[type="submit"]'),
      //   await waitForNetworkIdle(instagram.page, 5000, 0),
    ]);
    await instagram.page.evaluate(() => {
      let element = document.querySelector(
        "#react-root > div > div > section > main > div > div > div > div > button"
      );
      if (typeof element != "undefined" && element != null) {
        element.click();
      }
    });
  },

  close: async () => {
    instagram.browser.close();
  },
};

module.exports = instagram;
