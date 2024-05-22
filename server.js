const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the "public" directory
app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/ping', (req, res) => {
    res.send('Good!');
});

// Define a route for scraping data
app.get('/check', async (req, res) => {
    const keyword = req.query.key;
    try {
        // URL to scrape
        const url = `https://checkscam.com/scams?keyword=${keyword}`;

        // Fetch the HTML of the page
        const { data } = await axios.get(url);

        // Load the HTML into cheerio
        const $ = cheerio.load(data);

        let text = $("#main > div.section-page > div > div > div > div.alert.alert-danger.text-center").text().trim();
        let name = $("#main > div.section-page > div > div > div > div.vstack > div:nth-child(2) > div.scam-title.scam-column").text().trim();

        let money = $("#main > div.section-page > div > div > div > div.vstack > div:nth-child(2) > div.scam-column.scam-price").text().trim();
        let phone = $("#main > div.section-page > div > div > div > div.vstack > div:nth-child(2) > div:nth-child(3)").text().trim();
        let bankAccount = $("#main > div.section-page > div > div > div > div.vstack > div:nth-child(2) > div:nth-child(4)").text().trim();
        let bankName = $("#main > div.section-page > div > div > div > div.vstack > div:nth-child(2) > div:nth-child(5)").text().trim();
        let viewCount = $("#main > div.section-page > div > div > div > div.vstack > div:nth-child(2) > div:nth-child(6)").text().trim();
        let time = $("#main > div.section-page > div > div > div > div.vstack > div:nth-child(2) > div:nth-child(7)").text().trim();
        let link = $("#main > div.section-page > div > div > div > div.vstack > div:nth-child(2) > a").attr('href');
        let result = {
            text,
            name,
            money,
            phone,
            bankAccount,
            bankName,
            viewCount,
            time,
            link
        }

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error occurred while get data');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
