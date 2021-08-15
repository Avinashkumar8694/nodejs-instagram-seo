# nodejs-instagram-seo
## Want to collect Instagram Data? then you are at correct place.

#### This is a basic nodejs tool to collect Instagram post data. This tool usage puppeteer to scrap and get insta data.

### To begin with this
- create __dev.env__ and __prod.env__ file inside __environment__ directory at root folder.
- Add INSTAGRAM_USERNAME and INSTAGRAM_PASSWORD environment variable in the environment files based on environment to use.
- initilize the app using __npm i__
- run the app using __npm run start -- post > log.json__
- run the app using __npm run start -- hashtag=gadgets > log.json__
- use __-- post__ to collect posts from instagram homepage and __-- hashtag=hashTag_Name__ to collect post by hashtag
- data will be available in log.json file at root folder.
