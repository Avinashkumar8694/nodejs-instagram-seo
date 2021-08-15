const puppeteer = require("puppeteer");
const fs = require("fs-extra");
robot = require("robotjs");
const instagram = {
  browser: null,
  page: {},
  isRoboTab: false,
  interval: {},

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
    await instagram.page["home"].setViewport({
      width: 800,
      height: 800,
    });
  },

  createNewTab: async (name) => {
    instagram.page[name] = await instagram.browser.newPage();
  },

  initializeLogin: async (username, password) => {
    fs.ensureFileSync("cookies.json");
    const cookies = fs.readFileSync("cookies.json", "utf8");
    if (cookies) {
      instagram.isRoboTab = false;
      const deserializedCookies = JSON.parse(cookies);
      await instagram.page["home"].setCookie(...deserializedCookies);
      await instagram.page["home"].goto("https://www.instagram.com/", {
        waitUntil: "networkidle0",
      });
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
        response
          .text()
          .then(
            async function (responseData) {
              let textBody = JSON.parse(responseData);
              if (instagram.isValidHttpResponse(textBody)) {
                await instagram.storeData(textBody);
                if (instagram.hasNextPage(textBody)) {
                  instagram.scrollPageToBottom(`${tabName}`, true);
                } else {
                  instagram.scrollPageToBottom(`${tabName}`, false);
                  instagram.page[tabName].close();
                }
              }
            },
            (err) => {
              console.log(err);
            }
          )
          .catch((err) => {
            console.log(error);
          });
      }
    });
  },

  storeData : async (textBody) => {
    console.log(JSON.stringify(textBody));
  },

  isValidHttpResponse(textBody) {
    return (
      (textBody.data &&
        textBody.data.user &&
        textBody.data.user.edge_web_feed_timeline &&
        textBody.data.user.edge_web_feed_timeline.page_info.has_next_page) ||
      (textBody && textBody.sections)
    );
  },

  hasNextPage(textBody) {
    return (
      textBody?.data?.user?.edge_web_feed_timeline?.page_info.has_next_page ||
      textBody.more_available
    );
  },

  getPostByTag: async (hashtag) => {
    await instagram.createNewTab("hashtag");
    await instagram.collectInstaPost("hashtag");
    await instagram.page["hashtag"].goto(
      `https://www.instagram.com/explore/tags/${hashtag}/`
    );
    await instagram.skipConfirmationWindow("hashtag");
    await new Promise((r) => setTimeout(r, 5000));
    instagram.scrollPageToBottom("hashtag", true);
  },

  getPostData: async () => {
    await instagram.collectInstaPost("home");
    instagram.scrollPageToBottom("home", true);
  },

  skipConfirmationWindow: async (tabName = "home") => {
    if (instagram.isRoboTab) {
      robot.keyTap("tab");
      robot.keyTap("tab");
      robot.keyTap("enter");
      await instagram.page[tabName].waitForNavigation();
      robot.keyTap("tab");
      robot.keyTap("tab");
      robot.keyTap("enter");
    } else {
      if (tabName == "home") {
        robot.keyTap("tab");
        robot.keyTap("tab");
        robot.keyTap("tab");
        robot.keyTap("tab");
        robot.keyTap("enter");
      }
    }
  },

  close: async () => {
    Object.keys(instagram.page).forEach(async (el) => {
      await instagram.page[el].close();
    });
    await instagram.browser.close();
  },

  scrollPageToBottom: (tabName, scroll) => {
    try {
      clearInterval(instagram.interval[tabName]);
      instagram.interval[tabName] = setInterval(() => {
        instagram.page[tabName].evaluate(() => {
          window.scrollTo(0, document.body?.scrollHeight);
        });
      }, 1000);
      if (!scroll) {
        clearInterval(instagram.interval[tabName]);
      }
    } catch (err) {
      console.log(err);
    }
  },
  instagramLogout: async () => {
    // TODO fix logout
    const profileIcon =
      "#react-root > section > nav > div._8MQSO.Cx7Bp > div > div > div.ctQZg > div > div:nth-child(5) > span > img";
    await instagram.page["home"].focus(`${profileIcon}`);
    await instagram.page["home"].click(`${profileIcon}`);
  },
};

module.exports = instagram;
