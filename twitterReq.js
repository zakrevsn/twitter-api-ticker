const secrets = require("./secrets");
const https = require("https");

module.exports.getToken = function getToken() {
    return new Promise(function(resolve, reject) {
        let concatCreds = secrets.consumerKey + ":" + secrets.consumerSecret;
        let encodedCreds = Buffer.from(concatCreds).toString("base64");

        let options = {
            method: "POST",
            path: "/oauth2/token",
            host: "api.twitter.com",
            headers: {
                Authorization: `Basic ${encodedCreds}`,
                "Content-Type":
                    "application/x-www-form-urlencoded;charset=UTF-8"
            }
        };
        let cb = resp => {
            if (resp.statusCode !== 200) {
                reject(new Error("Error on response"));
            }
            let body = "";
            resp.on("data", chunk => {
                body += chunk;
            });
            resp.on("end", () => {
                console.log("body", body);
                try {
                    let parseBody = JSON.parse(body);
                    let bearerToken = parseBody.access_token;
                    resolve(bearerToken);
                } catch (err) {
                    reject(new Error(err));
                }
            });
        };
        https.request(options, cb).end("grant_type=client_credentials");
    });
};

module.exports.getTweets = function getTweets(bToken, userName) {
    return new Promise(function(resolve, reject) {
        let options = {
            method: "GET",
            path: `/1.1/statuses/user_timeline.json?screen_name=${userName}&tweet_mode=extended`,
            host: "api.twitter.com",
            headers: {
                Authorization: `Bearer ${bToken}`
            }
        };
        let cb = resp => {
            if (resp.statusCode !== 200) {
                console.log("error in getToken cb:", resp.statusCode);
                reject(new Error(resp.statusCode));

                return;
            }

            let body = "";

            resp.on("data", chunk => {
                body += chunk;
            });
            resp.on("end", () => {
                try {
                    let parseBody = JSON.parse(body);
                    resolve(parseBody);
                } catch (err) {
                    reject(new Error(err.tweets));
                }
            });
        };
        https.request(options, cb).end();
    });
};
module.exports.filterTweets = function filterTweets(tweets) {
    let headlines = [];
    tweets.forEach(tweet => {
        if (tweet.entities.urls.length == 1) {
            // splice for string from https://stackoverflow.com/a/20817684
            let newStr = tweet.full_text.split("");
            newStr.splice(
                tweet.entities.urls[0].indices[0],
                tweet.entities.urls[0].indices[1]
            );
            newStr = newStr.join("");
            let headline = {
                headline: newStr,
                href: tweet.entities.urls[0].expanded_url
            };

            headlines.push(headline);
        }
    });
    return headlines;
};
