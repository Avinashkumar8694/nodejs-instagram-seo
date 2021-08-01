const dotenv = require("dotenv");
const instagram = require("./instagram");
dotenv.config();
const username = process.env.INSTAGRAM_USERNAME;
const password = process.env.INSTAGRAM_PASSWORD;

(async () => {
  try {
    await instagram.initialize();
    await instagram.login(username, password);
    await instagram.skipConfirmationWindow();
    await instagram.collectInstaPost();
    process.on("exit", instagram.close);
    process.on("SIGINT", instagram.close);
  } catch (error) {
    console.log(error);
  }
})();
