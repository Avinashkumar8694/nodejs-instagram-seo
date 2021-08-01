const puppeteer = require("puppeteer");
const dotenv = require("dotenv");
dotenv.config();
(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: [
        "--allow-external-pages",
        "--allow-third-party-modules",
        "--data-reduction-proxy-http-proxies",
        "--no-sandbox",
      ],
    });
    const page = await browser.newPage();
    await page.goto("https://www.instagram.com/accounts/login/", {
      waitUntil: "networkidle2",
    });
    await page.setViewport({
      width: 800,
      height: 800,
    });

    const username = process.env.INSTAGRAM_USERNAME;
    const password = process.env.INSTAGRAM_PASSWORD;

    await page.waitFor('input[name="username"]');
    await page.focus('input[name="username"]');
    await page.keyboard.type(`${username}`);
    await page.focus('input[name="password"]');
    await page.keyboard.type(`${password}`);

    await page.click('button[type="submit"]');
    // await new Promise((r) => setTimeout(r, 5000));
    page.waitForNavigation({
      waitUntil: "domcontentloaded",
    });

    // await page.waitFor(8000);

    // await page.evaluate(() => {
    //   let element = document.querySelector(
    //     "#react-root > div > div > section > main > div > div > div > div > button"
    //   );
    //   if (typeof element != "undefined" && element != null) {
    //     element.click();
    //   }
    // });

    await Promise.all([
      page.waitForSelector("#react-root > div > div > section > main > div > div > div > div > button"),
      page.focus("#react-root > div > div > section > main > div > div > div > div > button"),
      page.click("#react-root > div > div > section > main > div > div > div > div > button")
    ]);

    // page.waitForNavigation({
    //   waitUntil: 'networkidle2',
    // })

    // await page.evaluate(() => {
    //   // let element = document.querySelector(
    //   //   "body > div.RnEpo.Yx5HN > div > div > div > div.mt3GC > button.aOOlW.HoLwm"
    //   // );
    //   // if (typeof element != "undefined" && element != null) {
    //   //   element.click();
    //   window.scrollTo(0, document.body.scrollHeight);
    //   // }
    // });
    // await Promise.all([
    //   await page.click('button[type="submit"]'),
    //   page.waitForNavigation({
    //     waitUntil: 'networkidle2',
    //   }),
    // ]);

    // await page.evaluate(() => {
    //   let element = document.querySelector(
    //     "#react-root > div > div > section > main > div > div > div > div > button"
    //   );
    //   if (typeof element != "undefined" && element != null) {
    //     element.click();
    //   }
    // });

    // function buttonClickAction(element) {
    //   if (typeof element != "undefined" && element != null) {
    //     element.click();
    //     window.scrollTo(0, document.body.scrollHeight);
    //   }
    // }

    page.on("response", async (response) => {
      try {
        let reqst = response.request();
        const resourceType = reqst.resourceType();
        if (resourceType == "xhr") {
          response.text().then(function (responseData) {
            let textBody = JSON.parse(responseData);
            if (
              textBody.data &&
              textBody.data.user &&
              textBody.data.user.edge_web_feed_timeline &&
              textBody.data.user.edge_web_feed_timeline.page_info.has_next_page
            ) {
              console.log(textBody);

              setTimeout(() => {
                page.evaluate(() =>
                  window.scrollTo(0, document.body.scrollHeight)
                );
              }, 10);
            }
          });
        }
      } catch (error) {
        console.log(error);
        // await browser.close();
      }
    });

    // await page.waitForSelector("body > div.RnEpo.Yx5HN > div > div > div > div.mt3GC > button.aOOlW.HoLwm")
    // await page.focus("body > div.RnEpo.Yx5HN > div > div > div > div.mt3GC > button.aOOlW.HoLwm");
    // await page.click("body > div.RnEpo.Yx5HN > div > div > div > div.mt3GC > button.aOOlW.HoLwm");
    // await page.evaluate(() => {
    //   // let element = document.querySelector(
    //   //   "body > div.RnEpo.Yx5HN > div > div > div > div.mt3GC > button.aOOlW.HoLwm"
    //   // );
    //   // if (typeof element != "undefined" && element != null) {
    //   //   element.click();
    //     window.scrollTo(0, document.body.scrollHeight);
    //   // }
    // });

    process.on("exit", closeBrowser);
    process.on("SIGINT", closeBrowser);

    async function closeBrowser() {
      console.log("Browser Closed");
      await browser.close();
    }
  } catch (error) {
    console.log(error);
    await browser.close();
  }
})();
