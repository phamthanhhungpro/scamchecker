const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the "public" directory
app.use(express.static("public"));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/ping", (req, res) => {
  res.send("Good!");
});

// Define a route for scraping data
app.get("/api/check", async (req, res) => {
  const keyword = req.query.key;
  try {
    // URL to scrape
    const url = `https://checkscam.com/scams?keyword=${keyword}`;

    // Fetch the HTML of the page
    const { data } = await axios.get(url);

    // Load the HTML into cheerio
    const $ = cheerio.load(data);

    let text = $(
      "#main > div.section-page > div > div > div > div.alert.alert-danger.text-center"
    )
      .text()
      .trim();
      const scamSelector = "[class=scam-card]";

      // Extract data from the HTML
      const scams = [];
      $(scamSelector).each((index, element) => {
        let name = $(element).find(".limit").text().trim();
        let money = $(element).find(".scam-price").text().trim();
        let phone = $(element).find(">div:nth-child(3)").text().trim();
        let bankAccount = $(element).find(">div:nth-child(4)").text().trim();
        let bankName = $(element).find(">div:nth-child(5)").text().trim();
        let viewCount = $(element).find(">div:nth-child(6)").text().trim();
        let time = $(element).find(">div:nth-child(7)").text().trim();
        let link = $(element).find("a").attr("href");
  
        scams.push({
          name,
          money,
          phone,
          bankAccount,
          bankName,
          viewCount,
          time,
          link,
        });
      });
  
      res.json({text, scams});
  } catch (error) {
    console.error(error);
    res.status(500).send("Error occurred while get data");
  }
});

app.get("/api/getAllScams", async (req, res) => {
  const page = req.query.page;
  try {
    // URL to scrape
    const url = `https://checkscam.com/scams?page=${page}`;

    // Fetch the HTML of the page
    const { data } = await axios.get(url);

    // Load the HTML into cheerio
    const $ = cheerio.load(data);

    // Define a CSS selector to target the product elements
    const scamSelector = "[class=scam-card]";

    // Extract data from the HTML
    const scams = [];
    $(scamSelector).each((index, element) => {
      let name = $(element).find(".limit").text().trim();
      let money = $(element).find(".scam-price").text().trim();
      let phone = $(element).find(">div:nth-child(3)").text().trim();
      let bankAccount = $(element).find(">div:nth-child(4)").text().trim();
      let bankName = $(element).find(">div:nth-child(5)").text().trim();
      let viewCount = $(element).find(">div:nth-child(6)").text().trim();
      let time = $(element).find(">div:nth-child(7)").text().trim();
      let link = $(element).find("a").attr("href");

      scams.push({
        name,
        money,
        phone,
        bankAccount,
        bankName,
        viewCount,
        time,
        link,
      });
    });

    res.json(scams);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error occurred while get data");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
