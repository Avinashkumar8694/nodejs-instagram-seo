
const dotenv = require("dotenv");
const puppeteer = require("puppeteer");
const instagram = require('./instagram');
dotenv.config();
const username = process.env.INSTAGRAM_USERNAME;
const password = process.env.INSTAGRAM_PASSWORD;

(async () => {
    try{
        await instagram.initialize(puppeteer);
        await ig.login(username,password);
    } catch(error){
        console.log(error);
        ig.close();
    }
});