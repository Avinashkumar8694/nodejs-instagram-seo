const puppeteer = require("puppeteer");
const fs = require("fs");
robot = require("robotjs");
const instagram = {
  browser: null,
  page: {},
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
    await instagram.createNewTab("home");
    // await instagram.page['home'].setViewport({
    //   width: 800,
    //   height: 800,
    // });
  },

  createNewTab: async (name) => {
    instagram.page[name] = await instagram.browser.newPage();
  },

  initializeLogin: async (username, password) => {
    const cookies = fs.readFileSync("cookies.json", "utf8");
    if (cookies) {
      const deserializedCookies = JSON.parse(cookies);
      await instagram.page["home"].setCookie(...deserializedCookies);
      await instagram.page["home"].goto("https://www.instagram.com/", {
        waitUntil: "networkidle0",
      });
      instagram.isRoboTab = false;
    } else {
      instagram.isRoboTab = true;
      await instagram.login(username, password);
    }
  },

  login: async (username, password) => {
    await instagram.page["home"].goto(
      "https://www.instagram.com/accounts/login/",
      {
        waitUntil: "networkidle0",
      }
    );
    await instagram.page["home"].focus('input[name="username"]');
    await instagram.page["home"].keyboard.type(`${username}`);
    await instagram.page["home"].focus('input[name="password"]');
    await instagram.page["home"].keyboard.type(`${password}`);
    await Promise.all([
      await instagram.page["home"].click('button[type="submit"]'),
      instagram.page["home"].waitForNavigation({ waitUntil: "load" }),
    ]);
    await new Promise((r) => setTimeout(r, 5000));
    const cookies = await instagram.page["home"].cookies();
    const cookieJson = JSON.stringify(cookies);
    fs.writeFileSync("cookies.json", cookieJson);
  },

  collectInstaPost: async (tabName = "home") => {
    instagram.page[tabName].on("response", async (response) => {
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
                instagram.scrollPageToBottom(tabName);
              } else {
                instagram.page[tabName].close();
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

  getPostByTag: async () => {
    await instagram.createNewTab("hashtag");
    await instagram.page["hashtag"].goto(
      `https://www.instagram.com/explore/tags/gadgets/`,
      {
        waitUntil: "networkidle0",
      }
    );
    await instagram.collectInstaPost('hashtag');
    instagram.scrollPageToBottom('hashtag');
  },

  skipConfirmationWindow: async () => {
    if (instagram.isRoboTab) {
      robot.keyTap("tab");
      robot.keyTap("tab");
      robot.keyTap("enter");
      await instagram.page["home"].waitForNavigation();
      robot.keyTap("tab");
      robot.keyTap("tab");
      robot.keyTap("enter");
      instagram.scrollPageToBottom('home');
    }
  },

  close: async () => {
    instagram.instagramLogout();
    instagram.browser.close();
  },

  scrollPageToBottom: async (tabName) => {
    setTimeout(() => {
      instagram.page[tabName].evaluate(() =>
        window.scrollTo(0, document.body.scrollHeight)
      );
    }, 350);
  },
  instagramLogout: async () => {
    const profileIcon =
      "#react-root > section > nav > div._8MQSO.Cx7Bp > div > div > div.ctQZg > div > div:nth-child(5) > span > img";
    await instagram.page["home"].focus(`${profileIcon}`);
    await instagram.page["home"].click(`${profileIcon}`);
  },
};

module.exports = instagram;
