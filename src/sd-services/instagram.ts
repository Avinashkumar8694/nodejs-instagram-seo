import * as puppeteer from "puppeteer";
import * as fs from "fs";
import * as robotjs from "robotjs";

let instagramInstance = null;
export class Instagramm {
  private instagram = {
    browser: null,
    page: {},
    isRoboTab: false,
    interval: {},
  };

  static getinstance(): Instagramm{
    if(!instagramInstance){
      instagramInstance = new Instagramm();
    }
    return instagramInstance;
  }

  async initialize(){
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

  async createNewTab(name: string){
    this.instagram.page[name] = await this.instagram.browser.newPage();
  }
}
