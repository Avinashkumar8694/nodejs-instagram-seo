const dotenv = require("dotenv");
const instagram = require("./src/sd-services/instagramapp");
const parseArgs = require("minimist");
dotenv.config();
const username = process.env.INSTAGRAM_USERNAME;
const password = process.env.INSTAGRAM_PASSWORD;
(async () => {
  const args = parseArgs(process.argv.slice(2));
  await instagram.initialize();
  await instagram.initializeLogin(username, password);
  await instagram.skipConfirmationWindow();
  switch (Object.keys(args)[1]) {
    case "post":
      await instagram.getPostData();
      break;
    case "hashtag":
      await instagram.getPostByTag("gadgets");
      break;
    default:
      console.log("invalid option");
  }
  process.on("beforeExit", async () => {
    console.log("beforeExit event")
    await instagram.close();
  });
  process.on("exit", async () => {
    console.log("exit event")
    await instagram.close();
  });
})().catch(err => console.error(err));
