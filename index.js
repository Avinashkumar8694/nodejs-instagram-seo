const dotenv = require("dotenv");
const instagram = require("./instagram");
const parseArgs = require('minimist')
dotenv.config();
const username = process.env.INSTAGRAM_USERNAME;
const password = process.env.INSTAGRAM_PASSWORD;
(async () => {
  try {
    const args = parseArgs(process.argv.slice(2));
    await instagram.initialize();
    await instagram.initializeLogin(username, password);
    await instagram.skipConfirmationWindow();
    switch (args.type) {
      case "post":
        await instagram.collectInstaPost();
        break;
      case "hashtag":
        await instagram.getPostByTag();
        break;
      default:
        console.log("invalid option");
    }
    console.log(args);
    process.on("exit", async() => {
     await instagram.close();
    });
  } catch (error) {
    console.log(error);
  }
})();
