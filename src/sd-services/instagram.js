const puppeteer = require("puppeteer");
const fs = require("fs-extra");
robot = require("robotjs");
let instagramInstance = null;
module.exports = class Instagram {
  instagram = {
    browser: null,
    page: {},
    isRoboTab: false,
    interval: {},
  };

  static getinstance() {
    if (!instagramInstance) {
      instagramInstance = new Instagram();
    }
    return instagramInstance;
  }

  async initialize() {
    this.instagram.browser = await puppeteer.launch({
      headless: false,
      args: [
        "--allow-external-pages",
        "--allow-third-party-modules",
        "--data-reduction-proxy-http-proxies",
        "--no-sandbox",
        "--disable-web-security",
      ],
    });
    await this.createNewTab("home");
    await this.instagram.page["home"].setViewport({
      width: 800,
      height: 800,
    });
  }

  async createNewTab(name) {
    this.instagram.page[name] = await this.instagram.browser.newPage();
  }

  async initializeLogin(username, password) {
    fs.ensureFileSync("cookies.json");
    const cookies = fs.readFileSync("cookies.json", "utf8");
    if (cookies) {
      this.instagram.isRoboTab = false;
      const deserializedCookies = JSON.parse(cookies);
      await this.instagram.page["home"].setCookie(...deserializedCookies);
      await this.instagram.page["home"].goto("https://www.instagram.com/", {
        waitUntil: "networkidle0",
      });
    } else {
      this.instagram.isRoboTab = true;
      await this.login(username, password);
    }
  }

  async login(username, password) {
    await this.instagram.page["home"].goto(
      "https://www.instagram.com/accounts/login/",
      {
        waitUntil: "networkidle0",
      }
    );
    await this.instagram.page["home"].focus('input[name="username"]');
    await this.instagram.page["home"].keyboard.type(`${username}`);
    await this.instagram.page["home"].focus('input[name="password"]');
    await this.instagram.page["home"].keyboard.type(`${password}`);
    await Promise.all([
      await this.instagram.page["home"].click('button[type="submit"]'),
      this.instagram.page["home"].waitForNavigation({ waitUntil: "load" }),
    ]);
    await new Promise((r) => setTimeout(r, 5000));
    const cookies = await this.instagram.page["home"].cookies();
    const cookieJson = JSON.stringify(cookies);
    fs.writeFileSync("cookies.json", cookieJson);
  }

  async collectInstaPost(tabName = "home") {
    const _that = this;
    this.instagram.page[tabName].on("response", async (response) => {
      let reqst = response.request();
      const resourceType = reqst.resourceType();
      const url = response.url();
      if (resourceType == "xhr") {
        if (this.isAcceptable(url)) {
          response
            .text()
            .then(
              async function (responseData) {
                let textBody = JSON.parse(responseData);
                if (_that.isValidHttpResponse(textBody)) {
                  if (_that.instagram.interval[tabName])
                    clearInterval(_that.instagram.interval[tabName]);
                  await _that.storeData(textBody);
                  if (_that.hasNextPage(textBody)) {
                    _that.scrollPageToBottom(`${tabName}`, true);
                  } else {
                    _that.scrollPageToBottom(`${tabName}`, false);
                    _that.instagram.page[tabName].close();
                  }
                }
              },
              (err) => {
                console.log(err);
              }
            )
            .catch((err) => {
              console.log(err);
            });
        }
      }
    });
  }

  isAcceptable(url) {
    return url.includes("?query_hash") || url.includes("/v1/tags/");
  }

  async storeData(textBody) {
      // console.log(JSON.stringify(textBody));
      for(let i = 0; i< 1000; i++){console.log(i)}
  }

  isValidHttpResponse(textBody) {
    return (
      (textBody.data &&
        textBody.data.user &&
        textBody.data.user.edge_web_feed_timeline &&
        textBody.data.user.edge_web_feed_timeline.page_info.has_next_page) ||
      (textBody && textBody.sections)
    );
  }

  hasNextPage(textBody) {
    return (
      textBody?.data?.user?.edge_web_feed_timeline?.page_info.has_next_page ||
      textBody.more_available
    );
  }

  async getPostByTag(hashtag) {
    await this.createNewTab("hashtag");
    await this.collectInstaPost("hashtag");
    await this.instagram.page["hashtag"].goto(
      `https://www.instagram.com/explore/tags/${hashtag}/`
    );
    await this.skipConfirmationWindow("hashtag");
    await new Promise((r) => setTimeout(r, 5000));
    this.scrollPageToBottom("hashtag", true);
  }

  async getPostData() {
    await this.collectInstaPost("home");
    this.scrollPageToBottom("home", true);
  }

  async skipConfirmationWindow(tabName = "home") {
    if (this.instagram.isRoboTab) {
      robot.keyTap("tab");
      robot.keyTap("tab");
      robot.keyTap("enter");
      await this.instagram.page[tabName].waitForNavigation();
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
  }

  async close() {
    if (this.instagram.interval["home"])
      clearInterval(this.instagram.interval["home"]);
    if (this.instagram.interval["hashtag"])
      clearInterval(this.instagram.interval["hashtag"]);
    await this.instagram.browser.close();
  }

  scrollPageToBottom(tabName, scroll) {
    try {
      const _that = this;
      if (_that.instagram.interval[tabName])
        clearInterval(_that.instagram.interval[tabName]);
      _that.instagram.interval[tabName] = setInterval(() => {
        _that.instagram.page[tabName].evaluate(() => {
          window.scrollTo(0, document.body?.scrollHeight);
        });
      }, 1000);
      if (!scroll) {
        clearInterval(_that.instagram.interval[tabName]);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async instagramLogout() {
    // TODO fix logout
    const profileIcon =
      "#react-root > section > nav > div._8MQSO.Cx7Bp > div > div > div.ctQZg > div > div:nth-child(5) > span > img";
    await instagram.page["home"].focus(`${profileIcon}`);
    await instagram.page["home"].click(`${profileIcon}`);
  }
};
