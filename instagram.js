const puppeteer = require("puppeteer");
const fs = require("fs");
robot = require("robotjs");
const instagram = {
  browser: null,
  page: null,
  isRoboTab: false,

  initialize: async () => {
    instagram.browser = await puppeteer.launch({
      headless: false,
      args: [
        "--allow-external-pages",
        "--allow-third-party-modules",
        "--data-reduction-proxy-http-proxies",
        "--no-sandbox",
        "--disable-web-security",
      ],
    });
    instagram.page = await instagram.browser.newPage();
    // await instagram.page.setViewport({
    //   width: 800,
    //   height: 800,
    // });
  },

  initializeLogin: async (username, password) => {
    const cookies = fs.readFileSync("cookies.json", "utf8");
    if (cookies) {
      const deserializedCookies = JSON.parse(cookies);
      await instagram.page.setCookie(...deserializedCookies);
      await instagram.page.goto("https://www.instagram.com/", {
        waitUntil: "networkidle0",
      });
      instagram.isRoboTab = false;
    } else {
      instagram.isRoboTab = true;
      await instagram.login(username, password);
    }
  },

  login: async (username, password) => {
    await instagram.page.goto("https://www.instagram.com/accounts/login/", {
      waitUntil: "networkidle0",
    });
    await instagram.page.focus('input[name="username"]');
    await instagram.page.keyboard.type(`${username}`);
    await instagram.page.focus('input[name="password"]');
    await instagram.page.keyboard.type(`${password}`);
    await Promise.all([
      await instagram.page.click('button[type="submit"]'),
      instagram.page.waitForNavigation({ waitUntil: "load" }),
    ]);
    await new Promise((r) => setTimeout(r, 5000));
    const cookies = await instagram.page.cookies();
    const cookieJson = JSON.stringify(cookies);
    fs.writeFileSync("cookies.json", cookieJson);
  },

  collectInstaPost: async () => {
    instagram.page.on("response", async (response) => {
      let reqst = response.request();
      const resourceType = reqst.resourceType();
      if (resourceType == "xhr") {
        response.text().then(
          function (responseData) {
            let textBody = JSON.parse(responseData);
            if (
              textBody.data &&
              textBody.data.user &&
              textBody.data.user.edge_web_feed_timeline &&
              textBody.data.user.edge_web_feed_timeline.page_info.has_next_page
            ) {
              console.log(JSON.stringify(textBody));
              if (
                textBody.data.user.edge_web_feed_timeline.page_info
                  .has_next_page
              ) {
                instagram.scrollPageToBottom();
              } else {
                instagram.close();
              }
            }
          },
          (err) => {
            console.log(err);
          }
        );
      }
    });
  },

  skipConfirmationWindow: async () => {
    if (instagram.isRoboTab) {
      robot.keyTap("tab");
      robot.keyTap("tab");
      robot.keyTap("enter");
      await instagram.page.waitForNavigation();
      robot.keyTap("tab");
      robot.keyTap("tab");
      robot.keyTap("enter");
    }
    instagram.scrollPageToBottom();
  },

  close: async () => {
    instagram.instagramLogout();
    instagram.browser.close();
  },

  scrollPageToBottom: async () => {
    setTimeout(() => {
      instagram.page.evaluate(() =>
        window.scrollTo(0, document.body.scrollHeight)
      );
    }, 350);
  },
  instagramLogout: async () => {
    const profileIcon =
      "#react-root > section > nav > div._8MQSO.Cx7Bp > div > div > div.ctQZg > div > div:nth-child(5) > span > img";
    await instagram.page.focus(`${profileIcon}`);
    await instagram.page.click(`${profileIcon}`);
  },
};

module.exports = instagram;
