const express = require("express");
const auth = require('./middlewares/auth');
const role = require('./middlewares/role');
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require('cors');
const { initializeDatabase, Reports, Scammers, sequelize } = require('./db/db.js');
const bodyParser = require('body-parser');
const { Op } = require('sequelize');
const upload = require('./db/multer.js');
const userRoutes = require('./controller/user.js');
const baohiemRoutes = require('./controller/bao-hiem.js');
const { Pool } = require('pg');  // Import the pg library

// Create a PostgreSQL client
const pool = new Pool({
  user: 'logstore',
  host: '46.250.224.140',
  database: 'logstore',
  password: 'Logstore@1331',
  port: 5432,
});

// Function to log request details to PostgreSQL, including a JSON data column
async function logRequest(ip, action, jsonData) {
  const query = `
    INSERT INTO ScamCheckerLog (Ip, Action, Time, Data)
    VALUES ($1, $2, NOW(), $3)
  `;
  try {
    await pool.query(query, [ip, action, jsonData]);
    console.log(`Logged request: ${action} from IP: ${ip} with data: ${jsonData}`);
  } catch (err) {
    console.error('Error logging request:', err);
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from the "public" directory
app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.json());
app.use(cors()); // Enable CORS

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/ping", (req, res) => {
  res.send("Good!");
});

app.use('/api/user', userRoutes);
app.use('/api/baohiem', baohiemRoutes);

// Define a route for scraping data
app.get("/api/check", async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const action = 'Check Scam';

  const keyword = req.query.key;
  try {

    // Get data from own database first
    const ownData = await Scammers.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${keyword}%` } },
          { phone: { [Op.iLike]: `%${keyword}%` } },
          { bankAccount: { [Op.iLike]: `%${keyword}%` } },
        ],
      },
    });

    if (ownData.length > 0) {
      let text = `Tìm thấy ${ownData.length} kết quả từ dữ liệu của chúng tôi.`;
      res.json({ text, scams: ownData });
      return;
    }

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

    if (scams.length > 0) {
      // Save to own database
      try {
        await Scammers.bulkCreate(scams);
      } catch (error) {
        console.error('Error saving data to own database:', error);
      }
    }

    logRequest(ip, action, JSON.stringify({ keyword, result: scams.length }));
    res.json({ text, scams });
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
    const scams = await Scammers.findAll();
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


app.get("/api/getScamDetail", async (req, res) => {
  const id = req.query.id;
  try {
    // URL to scrape
    const url = `https://checkscam.com/scams/${id}.html`;

    // Fetch the HTML of the page
    const { data } = await axios.get(url);

    // Load the HTML into cheerio
    const $ = cheerio.load(data);

    // Define a CSS selector to target the product elements
    const scamInfoSelector = "[class='scammer-information'] .scammer-body";

    // Extract data from the HTML

    let name = $(scamInfoSelector).find(">div:nth-child(1) .information-item_value").text().trim();
    let bankAccount = $(scamInfoSelector).find(">div:nth-child(2) .information-item_value").text().trim();
    let bankName = $(scamInfoSelector).find(">div:nth-child(3) .information-item_value").text().trim();
    let money = $(scamInfoSelector).find(">div:nth-child(4) .information-item_value").text().trim();
    let type = $(scamInfoSelector).find(">div:nth-child(5) .information-item_value").text().trim();
    let content = $(scamInfoSelector).find(">div:nth-child(7) .information-item_value").text().trim();

    const imageSelector = ".information-item_images a";
    const imageUrls = [];
    $(imageSelector).each((index, element) => {
      let imageUrl = $(element).attr("href");
      imageUrls.push(imageUrl);
    });

    const scamReporterSelector = ".scammer-information.scammer-information_sidebar .scammer-body"
    let reporterName = $(scamReporterSelector).find(">div:nth-child(1) .information-item_value").text().trim();
    let reporterPhone = $(scamReporterSelector).find(">div:nth-child(2) .information-item_value").text().trim();
    let reporterReputation = $(scamReporterSelector).find(">div:nth-child(3) .information-item_value").text().trim();
    let reportCount = $(scamReporterSelector).find(">div:nth-child(4) .information-item_value").text().trim();
    let joinDate = $(scamReporterSelector).find(">div:nth-child(5) .information-item_value").text().trim();


    let scamDetail = {
      name,
      bankAccount,
      bankName,
      money,
      type,
      imageUrls,
      content,
      reporterName,
      reporterPhone,
      reporterReputation,
      reportCount,
      joinDate
    };

    res.json(scamDetail);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error occurred while get data");
  }
});

app.get('/api/getScammerDetailById', async (req, res) => {
  const id = req.query.id;

  try {
    const user = await Scammers.findByPk(id);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).send('Report not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/send-report', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server Error');
    }

    try {
      const {
        scammerName,
        accountNumber,
        bank,
        amount,
        website,
        phone,
        category,
        email,
        content,
        source,
        reporterName,
        reporterPhone
      } = req.body;

      // Save file paths
      const uploadFiles = req.files.map(file => file.path);

      await Reports.create({
        scammerName: scammerName,
        accountNumber: accountNumber,
        bank: bank,
        amount: amount,
        phone: phone,
        website: website,
        category: category,
        email: email,
        content: content,
        source: source,
        reporterName: reporterName,
        reporterPhone: reporterPhone,
        uploadFiles: uploadFiles,
        date: new Date()
      });

      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Server Error' });
    }
  });
});

app.get('/api/getAllReports', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const { count, rows } = await Reports.findAndCountAll({
      where: {
      status: {
        [Op.ne]: 'approved'
      }
      },
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });

    res.status(200).json({
      total: count,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      data: rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/api/getReportDetail', async (req, res) => {
  const id = req.query.id;

  try {
    const user = await Reports.findByPk(id);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).send('Report not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Example protected route
app.get('/admin', (req, res) => {
  res.send('Admin content');
});


initializeDatabase()
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  });


app.post('/api/approveReport', async (req, res) => {
  const reportId = req.body.id;

  const transaction = await sequelize.transaction();

  try {
    const report = await Reports.findOne({ where: { id: reportId }, transaction });
    if (!report) {
      throw new Error('Report not found');
    }

    report.status = 'approved';
    await report.save({ transaction });

    await Scammers.create({
      name: report.scammerName,
      money: report.amount.toString(),
      phone: report.phone,
      bankAccount: report.accountNumber,
      bankName: report.bank,
      viewCount: '0',
      time: new Date().toISOString(),
      link: report.website || '',
      isCrawled: false
    }, { transaction });

    await transaction.commit();

    res.status(200).json({ message: 'Report approved and scam record added' });
  } catch (err) {
    await transaction.rollback();
    res.status(500).json({ error: err.message });
  }
});

// api to upload multiple files
app.post('/api/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server Error');
    }

    const uploadFiles = req.files.map(file => file.path);
    res.json({ uploadFiles });
  });
});

// server file from uploads folder
app.get('/api/uploads/:filename', (req, res) => {
  const { filename } = req.params;
  res.sendFile(__dirname + `/uploads/${filename}`);
});

