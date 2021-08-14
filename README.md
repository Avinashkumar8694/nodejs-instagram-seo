# nodejs-instagram-seo
## Want to collect Instagram Data? then you are at correct place.

#### This is a basic nodejs tool to collect Instagram post data. This tool usage puppeteer to scrap and get insta data.

### To begin with this
- create __.env__ file at root folder.
- Add INSTAGRAM_USERNAME and INSTAGRAM_PASSWORD environment variable in .env file.
- create __cookies.json__ file to store the instagram cookies to avoid login again and again.
- initilize the app using __npm i__
- run the app using __node index.js --post > log.json__
- run the app using __node index.js --hashtag gadgets > log.json__
- use __--post__ to collect posts from instagram homepage and __--hashtag hashTag_Name__ to collect post by hashtag
- data will be available in __log.json__ file at root folder.
