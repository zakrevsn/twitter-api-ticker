const express = require("express");
const app = express();

app.use(express.static("./Ticker"));

const { getToken, getTweets, filterTweets } = require("./twitterReq");

app.get("/data.json", (req, res) => {
    getToken().then(token => {
        return Promise.all([
            getTweets(token, "bbcworld"),
            getTweets(token, "theonion"),
            getTweets(token, "foxnews")
        ])
            .then(results => {
                let resArr = [];
                resArr = resArr.concat(results[0], results[1], results[2]);
                resArr.sort((a, b) => b.id - a.id);
                let filteredTweets = filterTweets(resArr);
                res.json(filteredTweets);
            })
            .catch(err => {
                console.log(err);
            });
    });
});

app.listen(8080, () => console.log("listening!"));
