import { Instagramm as insta} from "./sd-services/instagram";
import * as dotenv from 'dotenv';
import * as parseArgs from 'minimist';
dotenv.config();
const username = process.env.INSTAGRAM_USERNAME;
const password = process.env.INSTAGRAM_PASSWORD;
const instagramInstance = insta.getinstance();
(async () => {
    const args = parseArgs(process.argv.slice(2));
    instagramInstance.initialize();
})();
