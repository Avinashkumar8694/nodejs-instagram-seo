const dotenv = require("dotenv");
const Instagram = require("./src/sd-services/instagram");
const parseArgs = require("minimist");
dotenv.config();
const username = process.env.INSTAGRAM_USERNAME;
const password = process.env.INSTAGRAM_PASSWORD;
(async () => {
    const instagramInst = Instagram.getinstance();
    const args = parseArgs(process.argv.slice(2));
    await instagramInst.initialize();
    await instagramInst.initializeLogin(username, password);
    await instagramInst.skipConfirmationWindow();
    switch (Object.keys(args)[1]) {
      case "post":
        await instagramInst.getPostData();
        break;
      case "hashtag":
        await instagramInst.getPostByTag("gadgets");
        break;
      default:
        console.log("invalid option");
    }
    process.on("beforeExit", async () => {
      console.log("beforeExit event")
      await instagramInst.close();
    });
    process.on("exit", async () => {
      console.log("exit event")
      await instagramInst.close();
    });
  })().catch(err => console.error(err));