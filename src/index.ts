import { Instagramm as insta } from "./sd-services/instagram";
import * as dotenv from "dotenv";
import * as parseArgs from "minimist";
import * as path from 'path'
const envFileName = process.env.APP_ENV ? `${process.env.APP_ENV}.env` : 'dev.env';
const envFilePath = `${process.cwd()}${path.sep}environments${path.sep}${envFileName}`;
dotenv.config({ path: envFilePath });
const username = process.env.INSTAGRAM_USERNAME;
const password = process.env.INSTAGRAM_PASSWORD;
(async () => {
  const args = parseArgs(process.argv.slice(2));
  const argsKv = args['_'].length ?  args['_'][0].split('=') : null;
  console.log(argsKv)
  const instagramInstance = await insta.getinstance();
  if(argsKv.length){
    await instagramInstance.initialize();
    await instagramInstance.initializeLogin(username, password);
    await instagramInstance.skipConfirmationWindow();
    switch (argsKv[0]) {
      case "post":
        await instagramInstance.getPostData();
        break;
      case "hashtag":
        if(argsKv.length == 1){
          console.log("missing hashtag");
          break;
        }
        await instagramInstance.getPostByTag("gadgets");
        break;
      default:
        console.log("invalid option");
    }
  }
  process.on("beforeExit", async () => {
    console.log("beforeExit event");
    await instagramInstance.close();
    process.exit(0);
  });
  // process.on('SIGINT', async () => {
  //   console.log("sigint event");
  //   await instagramInstance.close();
  //   process.exit();
  // });
  // process.on("exit", async () => {
  //   console.log("exit event");
  //   await instagramInstance.close();
  // });
})().catch((err) => {});
