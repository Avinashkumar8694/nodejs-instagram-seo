import * as puppeteer from "puppeteer";
import * as fs from "fs-extra";
import * as robot from "robotjs";

let instagramInstance = null;
export class Instagramm {
  instagram = {
    browser: null,
    page: {},
    isRoboTab: false,
    interval: {},
  };

  static getinstance() {
    if (!instagramInstance) {
      instagramInstance = new Instagramm();
    }
    return instagramInstance;
  }

  async initialize() {
    return new Promise(async (resolve, reject) => {
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
      return resolve(true);
    });
  }

  async createNewTab(name: string) {
    return new Promise(async (resolve, reject) => {
      this.instagram.page[name] = await this.instagram.browser.newPage();
      console.log("page", this.instagram.page);
      return resolve(this.instagram.page[name]);
    });
  }

  async initializeLogin(username, password) {
    fs.ensureFileSync("./cookies.json");
    const cookies = fs.readFileSync("./cookies.json", "utf8");
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

  collectInstaPost(tabName = "home") {
    this.instagram.page[tabName].on("response", async (response) => {
      let reqst = response.request();
      const _that = this;
      const resourceType = reqst.resourceType();
      if (resourceType == "xhr") {
        response
          .text()
          .then(
            async function (responseData) {
              let textBody = JSON.parse(responseData);
              if (_that.isValidHttpResponse(textBody)) {
                _that.scrollPageToBottom(`${tabName}`, false);

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
    });
  }

  async storeData(textBody) {
    console.log(JSON.stringify(textBody));
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
    this.collectInstaPost("hashtag");
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
      // await this.instagram.page[tabName].waitForNavigation();
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

  scrollPageToBottom(tabName, scroll) {
    try {
      if (!scroll) {
        clearInterval(this.instagram.interval[tabName]);
      } else {
        clearInterval(this.instagram.interval[tabName]);
        this.instagram.interval[tabName] = setInterval(() => {
          this.instagram.page[tabName].evaluate(() => {
            window.scrollTo(0, document.body?.scrollHeight);
          });
        }, 1000);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async instagramLogout() {
    // TODO fix logout
    const profileIcon =
      "#react-root > section > nav > div._8MQSO.Cx7Bp > div > div > div.ctQZg > div > div:nth-child(5) > span > img";
    await this.instagram.page["home"].focus(`${profileIcon}`);
    await this.instagram.page["home"].click(`${profileIcon}`);
  }

  async close() {
    try {
      Object.keys(this.instagram.page).forEach(async (el) => {
        await this.instagram.page[el].close();
      });
      await this.instagram.browser.close();
    } catch (err) {
      console.log(err);
    }
  }
}
